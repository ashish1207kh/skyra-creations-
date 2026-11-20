import os
import uuid
import csv
import io
from datetime import datetime
from typing import Optional, List
from pathlib import Path

from fastapi import (
    FastAPI,
    Depends,
    HTTPException,
    UploadFile,
    File,
    Form,
    status,
    Query,
    Request,
)
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import JSONResponse, StreamingResponse
from sqlalchemy.orm import Session
from sqlalchemy import or_, desc

from app.config import (
    BASE_DIR,
    UPLOAD_DIR,
    SCREENSHOT_DIR,
    DEFAULT_EVENT_NAME,
    DEFAULT_TOTAL_FEE,
    DEFAULT_UPI_ID,
    DEFAULT_UPI_NAME,
    DEFAULT_WHATSAPP_SUPPORT,
)
from app.database import get_db, engine, Base
from app.models import Participant, Payment, AdminUser, SystemSetting
from app.schemas import (
    ParticipantResponse,
    ParticipantLookupResponse,
    PaymentResponse,
    VerificationRequest,
    AdminLoginRequest,
    AdminLoginResponse,
    StatsResponse,
    PaymentInfoResponse,
)
from app.auth import (
    hash_password,
    verify_password,
    create_access_token,
    get_current_admin,
)
from app.seed import seed_database

# Ensure database tables and initial seed
Base.metadata.create_all(bind=engine)
seed_database()

app = FastAPI(
    title="Skyra Creations - Runway Show & Balance Payment API",
    description="Backend API powering participant registration, balance payments, verification, and event management.",
    version="1.0.0",
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount static uploads
app.mount("/uploads", StaticFiles(directory=str(UPLOAD_DIR)), name="uploads")





def get_setting_value(db: Session, key: str, default: str) -> str:
    setting = db.query(SystemSetting).filter(SystemSetting.key == key).first()
    return setting.value if setting else default


def build_screenshot_url(request: Request, filename: Optional[str]) -> str:
    if not filename:
        return ""
    base_url = str(request.base_url).rstrip("/")
    return f"{base_url}/uploads/screenshots/{filename}"


def generate_reg_id(db: Session) -> str:
    """Generate friendly sequential Registration ID: SC-2026-XXXX"""
    count = db.query(Participant).count() + 1001
    reg_id = f"SC-2026-{count}"
    while db.query(Participant).filter(Participant.reg_id == reg_id).first():
        count += 1
        reg_id = f"SC-2026-{count}"
    return reg_id


def generate_payment_id(payment_type: str) -> str:
    prefix = "REG" if "INITIAL" in payment_type else "BAL"
    unique_suffix = uuid.uuid4().hex[:8].upper()
    return f"PAY-{prefix}-{unique_suffix}"


# ============================================================================
# PUBLIC ENDPOINTS
# ============================================================================

@app.get("/api/payment-info", response_model=PaymentInfoResponse)
def get_payment_info(request: Request, db: Session = Depends(get_db)):
    event_name = get_setting_value(db, "event_name", DEFAULT_EVENT_NAME)
    upi_id = get_setting_value(db, "upi_id", DEFAULT_UPI_ID)
    upi_name = get_setting_value(db, "upi_name", DEFAULT_UPI_NAME)
    total_fee = float(get_setting_value(db, "total_fee", str(DEFAULT_TOTAL_FEE)))

    base_url = str(request.base_url).rstrip("/")
    qr_url = f"{base_url}/uploads/qr_code.png"

    return PaymentInfoResponse(
        event_name=event_name,
        upi_id=upi_id,
        upi_name=upi_name,
        default_total_fee=total_fee,
        allowed_balance_amounts=[500, 1000, 1500, 2000, 2500, 3000, 3500],
        qr_code_url=qr_url,
    )


@app.post("/api/register")
async def register_participant(
    request: Request,
    full_name: str = Form(...),
    email: str = Form(...),
    dob: str = Form(...),
    gender: str = Form(...),
    mobile: str = Form(...),
    whatsapp: str = Form(...),
    city: str = Form(...),
    category: str = Form("Runway Model"),
    height: Optional[str] = Form(None),
    instagram: Optional[str] = Form(None),
    experience: Optional[str] = Form(None),
    amount: float = Form(...),
    transaction_id: str = Form(...),
    terms_confirmed: bool = Form(...),
    screenshot: UploadFile = File(...),
    db: Session = Depends(get_db),
):
    if not terms_confirmed:
        raise HTTPException(status_code=400, detail="You must confirm the terms and conditions to register.")

    # Validate amount
    total_event_fee = float(get_setting_value(db, "total_fee", str(DEFAULT_TOTAL_FEE)))
    if amount <= 0 or amount > total_event_fee:
        raise HTTPException(
            status_code=400,
            detail=f"Amount must be between ₹1 and ₹{int(total_event_fee)}",
        )

    # Check for existing email / phone
    existing = db.query(Participant).filter(
        or_(
            Participant.email == email.strip().lower(),
            Participant.mobile == mobile.strip(),
        )
    ).first()
    if existing:
        raise HTTPException(
            status_code=400,
            detail=f"A participant is already registered with email {email} or mobile {mobile}. Their Registration ID is {existing.reg_id}. Please use the Balance Payment portal.",
        )

    # Save payment screenshot
    file_ext = os.path.splitext(screenshot.filename)[1].lower()
    if file_ext not in [".jpg", ".jpeg", ".png", ".webp", ".pdf"]:
        file_ext = ".png"

    unique_filename = f"reg_{uuid.uuid4().hex}_{datetime.utcnow().strftime('%Y%m%d%H%M%S')}{file_ext}"
    dest_path = SCREENSHOT_DIR / unique_filename

    content = await screenshot.read()
    if len(content) > 10 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="Screenshot file size exceeds 10MB limit.")

    with open(dest_path, "wb") as f:
        f.write(content)

    # Create Participant
    reg_id = generate_reg_id(db)
    participant = Participant(
        reg_id=reg_id,
        full_name=full_name.strip(),
        email=email.strip().lower(),
        dob=dob.strip(),
        gender=gender.strip(),
        mobile=mobile.strip(),
        whatsapp=whatsapp.strip(),
        city=city.strip(),
        category=category.strip(),
        height=height.strip() if height else None,
        instagram=instagram.strip() if instagram else None,
        experience=experience.strip() if experience else None,
        total_fee=total_event_fee,
        amount_paid=0.0,
        balance_due=total_event_fee,
        status="PENDING_VERIFICATION",
    )
    db.add(participant)
    db.flush()

    # Create Payment record
    payment_id = generate_payment_id("INITIAL_REGISTRATION")
    payment = Payment(
        payment_id=payment_id,
        participant_id=participant.id,
        reg_id=reg_id,
        payment_type="INITIAL_REGISTRATION",
        amount=amount,
        transaction_id=transaction_id.strip(),
        screenshot_filename=unique_filename,
        status="PENDING",
    )
    db.add(payment)
    db.flush()
    db.commit()
    db.refresh(participant)

    return {
        "success": True,
        "message": "Registration submitted successfully! Our team will verify your payment and contact you on WhatsApp.",
        "reg_id": participant.reg_id,
        "participant": {
            "id": participant.id,
            "reg_id": participant.reg_id,
            "full_name": participant.full_name,
            "email": participant.email,
            "total_fee": participant.total_fee,
            "amount_paid": participant.amount_paid,
            "balance_due": participant.balance_due,
            "status": participant.status,
        },
        "payment": {
            "payment_id": payment.payment_id,
            "amount": payment.amount,
            "transaction_id": payment.transaction_id,
            "status": payment.status,
            "screenshot_url": build_screenshot_url(request, payment.screenshot_filename),
        },
    }


@app.get("/api/participant/lookup/{query}")
def lookup_participant(query: str, request: Request, db: Session = Depends(get_db)):
    clean_q = query.strip()
    participant = (
        db.query(Participant)
        .filter(
            or_(
                Participant.reg_id.ilike(clean_q),
                Participant.mobile == clean_q,
                Participant.email.ilike(clean_q),
            )
        )
        .first()
    )

    if not participant:
        raise HTTPException(
            status_code=404,
            detail=f"No registration found matching '{query}'. Please check your Registration ID or contact team.",
        )

    # Format payments
    payments_list = []
    for p in participant.payments:
        payments_list.append({
            "id": p.id,
            "payment_id": p.payment_id,
            "reg_id": p.reg_id,
            "payment_type": p.payment_type,
            "amount": p.amount,
            "transaction_id": p.transaction_id,
            "screenshot_url": build_screenshot_url(request, p.screenshot_filename),
            "status": p.status,
            "rejection_reason": p.rejection_reason,
            "verified_by": p.verified_by,
            "verified_at": p.verified_at,
            "created_at": p.created_at,
        })

    return {
        "reg_id": participant.reg_id,
        "full_name": participant.full_name,
        "email": participant.email,
        "mobile": participant.mobile,
        "whatsapp": participant.whatsapp,
        "city": participant.city,
        "category": participant.category,
        "height": participant.height,
        "instagram": participant.instagram,
        "experience": participant.experience,
        "status": participant.status,
        "total_fee": participant.total_fee,
        "amount_paid": participant.amount_paid,
        "balance_due": participant.balance_due,
        "payments": payments_list,
        "created_at": participant.created_at,
    }


@app.post("/api/balance-payment")
async def submit_balance_payment(
    request: Request,
    reg_id: str = Form(...),
    full_name: str = Form(...),
    amount: float = Form(...),
    transaction_id: str = Form(...),
    terms_confirmed: bool = Form(...),
    screenshot: UploadFile = File(...),
    db: Session = Depends(get_db),
):
    if not terms_confirmed:
        raise HTTPException(status_code=400, detail="You must confirm the terms and details.")

    # Find participant
    clean_reg_id = reg_id.strip().upper()
    participant = db.query(Participant).filter(Participant.reg_id.ilike(clean_reg_id)).first()
    if not participant:
        raise HTTPException(
            status_code=404,
            detail=f"Registration ID '{reg_id}' was not found. Please verify your Registration ID.",
        )

    # Name match check (case-insensitive substring or match)
    if full_name.strip().lower() not in participant.full_name.lower() and participant.full_name.lower() not in full_name.strip().lower():
        # Soft check warning but proceed or reject
        pass

    if participant.balance_due <= 0 and participant.status == "FULLY_PAID":
        raise HTTPException(
            status_code=400,
            detail=f"Participant {participant.full_name} ({participant.reg_id}) has already cleared the full payment! No balance due.",
        )

    if amount <= 0:
        raise HTTPException(status_code=400, detail="Payment amount must be greater than zero.")

    # Save screenshot
    file_ext = os.path.splitext(screenshot.filename)[1].lower()
    if file_ext not in [".jpg", ".jpeg", ".png", ".webp", ".pdf"]:
        file_ext = ".png"

    unique_filename = f"bal_{uuid.uuid4().hex}_{datetime.utcnow().strftime('%Y%m%d%H%M%S')}{file_ext}"
    dest_path = SCREENSHOT_DIR / unique_filename

    content = await screenshot.read()
    if len(content) > 10 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="Screenshot file size exceeds 10MB limit.")

    with open(dest_path, "wb") as f:
        f.write(content)

    payment_id = generate_payment_id("BALANCE_PAYMENT")
    payment = Payment(
        payment_id=payment_id,
        participant_id=participant.id,
        reg_id=participant.reg_id,
        payment_type="BALANCE_PAYMENT",
        amount=amount,
        transaction_id=transaction_id.strip(),
        screenshot_filename=unique_filename,
        status="PENDING",
    )
    db.add(payment)
    db.commit()
    db.refresh(payment)

    return {
        "success": True,
        "message": f"Balance payment of ₹{int(amount)} submitted successfully! Our team will verify your payment proof.",
        "reg_id": participant.reg_id,
        "payment_id": payment.payment_id,
        "amount": payment.amount,
        "status": payment.status,
        "participant_name": participant.full_name,
        "current_balance_due": participant.balance_due,
    }


@app.get("/api/participant/{reg_id}/pass")
def get_participant_pass(reg_id: str, request: Request, db: Session = Depends(get_db)):
    clean_reg_id = reg_id.strip().upper()
    participant = db.query(Participant).filter(Participant.reg_id.ilike(clean_reg_id)).first()
    if not participant:
        raise HTTPException(status_code=404, detail="Participant not found.")

    event_name = get_setting_value(db, "event_name", DEFAULT_EVENT_NAME)
    base_url = str(request.base_url).rstrip("/")

    return {
        "event_name": event_name,
        "reg_id": participant.reg_id,
        "full_name": participant.full_name,
        "category": participant.category,
        "city": participant.city,
        "status": participant.status,
        "total_fee": participant.total_fee,
        "amount_paid": participant.amount_paid,
        "balance_due": participant.balance_due,
        "verified_payments_count": len([p for p in participant.payments if p.status == "VERIFIED"]),
        "qr_verification_url": f"{base_url}/participant?query={participant.reg_id}",
        "entry_allowed": participant.status in ["PARTIALLY_PAID", "FULLY_PAID"],
    }


# ============================================================================
# ADMIN ENDPOINTS
# ============================================================================

@app.post("/api/admin/login")
def admin_login(creds: AdminLoginRequest, db: Session = Depends(get_db)):
    admin = db.query(AdminUser).filter(AdminUser.username == creds.username.strip()).first()
    if not admin or not verify_password(creds.password, admin.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
        )

    token = create_access_token(data={"sub": admin.username, "role": admin.role})
    return {
        "access_token": token,
        "token_type": "bearer",
        "admin": {
            "id": admin.id,
            "username": admin.username,
            "full_name": admin.full_name,
            "role": admin.role,
        },
    }


@app.get("/api/admin/stats", response_model=StatsResponse)
def get_admin_stats(
    db: Session = Depends(get_db),
    current_admin: AdminUser = Depends(get_current_admin),
):
    total_participants = db.query(Participant).count()
    verified_participants = db.query(Participant).filter(Participant.status.in_(["PARTIALLY_PAID", "FULLY_PAID"])).count()
    partially_paid = db.query(Participant).filter(Participant.status == "PARTIALLY_PAID").count()
    fully_paid = db.query(Participant).filter(Participant.status == "FULLY_PAID").count()
    rejected_count = db.query(Participant).filter(Participant.status == "REJECTED").count()

    # Financial sums
    verified_payments = db.query(Payment).filter(Payment.status == "VERIFIED").all()
    total_verified_revenue = sum(p.amount for p in verified_payments)

    pending_payments = db.query(Payment).filter(Payment.status == "PENDING").all()
    total_pending_amount = sum(p.amount for p in pending_payments)
    pending_verifications_count = len(pending_payments)

    all_participants = db.query(Participant).all()
    total_balance_due = sum(p.balance_due for p in all_participants)

    return StatsResponse(
        total_participants=total_participants,
        total_verified_revenue=total_verified_revenue,
        total_pending_amount=total_pending_amount,
        total_balance_due=total_balance_due,
        pending_verifications_count=pending_verifications_count,
        verified_participants_count=verified_participants,
        partially_paid_count=partially_paid,
        fully_paid_count=fully_paid,
        rejected_count=rejected_count,
    )


@app.get("/api/admin/participants")
def list_participants(
    request: Request,
    search: Optional[str] = None,
    status_filter: Optional[str] = None,
    gender: Optional[str] = None,
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
    current_admin: AdminUser = Depends(get_current_admin),
):
    query = db.query(Participant)

    if search:
        s = f"%{search.strip()}%"
        query = query.filter(
            or_(
                Participant.full_name.ilike(s),
                Participant.reg_id.ilike(s),
                Participant.email.ilike(s),
                Participant.mobile.ilike(s),
                Participant.city.ilike(s),
            )
        )

    if status_filter and status_filter != "ALL":
        query = query.filter(Participant.status == status_filter)

    if gender and gender != "ALL":
        query = query.filter(Participant.gender.ilike(gender))

    total = query.count()
    participants = (
        query.order_by(desc(Participant.created_at))
        .offset((page - 1) * page_size)
        .limit(page_size)
        .all()
    )

    results = []
    for p in participants:
        results.append({
            "id": p.id,
            "reg_id": p.reg_id,
            "full_name": p.full_name,
            "email": p.email,
            "dob": p.dob,
            "gender": p.gender,
            "mobile": p.mobile,
            "whatsapp": p.whatsapp,
            "city": p.city,
            "category": p.category,
            "height": p.height,
            "instagram": p.instagram,
            "experience": p.experience,
            "total_fee": p.total_fee,
            "amount_paid": p.amount_paid,
            "balance_due": p.balance_due,
            "status": p.status,
            "created_at": p.created_at,
            "payments": [
                {
                    "id": pay.id,
                    "payment_id": pay.payment_id,
                    "payment_type": pay.payment_type,
                    "amount": pay.amount,
                    "transaction_id": pay.transaction_id,
                    "status": pay.status,
                    "screenshot_url": build_screenshot_url(request, pay.screenshot_filename),
                    "created_at": pay.created_at,
                }
                for pay in p.payments
            ],
        })

    return {
        "total": total,
        "page": page,
        "page_size": page_size,
        "items": results,
    }


@app.get("/api/admin/payments")
def list_payments(
    request: Request,
    status_filter: Optional[str] = None,
    payment_type: Optional[str] = None,
    db: Session = Depends(get_db),
    current_admin: AdminUser = Depends(get_current_admin),
):
    query = db.query(Payment)

    if status_filter and status_filter != "ALL":
        query = query.filter(Payment.status == status_filter)

    if payment_type and payment_type != "ALL":
        query = query.filter(Payment.payment_type == payment_type)

    payments = query.order_by(desc(Payment.created_at)).all()

    results = []
    for p in payments:
        participant = p.participant
        results.append({
            "id": p.id,
            "payment_id": p.payment_id,
            "reg_id": p.reg_id,
            "participant_name": participant.full_name if participant else "Unknown",
            "participant_email": participant.email if participant else "",
            "participant_mobile": participant.mobile if participant else "",
            "participant_whatsapp": participant.whatsapp if participant else "",
            "payment_type": p.payment_type,
            "amount": p.amount,
            "transaction_id": p.transaction_id,
            "screenshot_url": build_screenshot_url(request, p.screenshot_filename),
            "status": p.status,
            "rejection_reason": p.rejection_reason,
            "verified_by": p.verified_by,
            "verified_at": p.verified_at,
            "created_at": p.created_at,
            "participant_total_fee": participant.total_fee if participant else 0,
            "participant_balance_due": participant.balance_due if participant else 0,
        })

    return results


@app.post("/api/admin/payments/{payment_id}/verify")
def verify_payment(
    payment_id: str,
    action_data: VerificationRequest,
    db: Session = Depends(get_db),
    current_admin: AdminUser = Depends(get_current_admin),
):
    payment = db.query(Payment).filter(Payment.payment_id == payment_id.strip()).first()
    if not payment:
        raise HTTPException(status_code=404, detail="Payment record not found.")

    act = action_data.action.upper()
    if act not in ["VERIFY", "REJECT"]:
        raise HTTPException(status_code=400, detail="Action must be 'VERIFY' or 'REJECT'")

    if act == "VERIFY":
        payment.status = "VERIFIED"
        payment.rejection_reason = None
        payment.verified_by = current_admin.full_name or current_admin.username
        payment.verified_at = datetime.utcnow()
    else:
        payment.status = "REJECTED"
        payment.rejection_reason = action_data.rejection_reason or "Payment screenshot or UTR could not be verified."
        payment.verified_by = current_admin.full_name or current_admin.username
        payment.verified_at = datetime.utcnow()

    db.flush()

    # Recalculate participant finances and status
    participant = payment.participant
    if participant:
        participant.recalculate_finances()

    db.commit()

    return {
        "success": True,
        "message": f"Payment {payment.payment_id} marked as {payment.status}.",
        "payment": {
            "payment_id": payment.payment_id,
            "status": payment.status,
            "rejection_reason": payment.rejection_reason,
            "verified_by": payment.verified_by,
            "verified_at": payment.verified_at,
        },
        "participant": {
            "reg_id": participant.reg_id,
            "amount_paid": participant.amount_paid,
            "balance_due": participant.balance_due,
            "status": participant.status,
        },
    }


@app.get("/api/admin/export")
def export_participants_csv(
    db: Session = Depends(get_db),
    current_admin: AdminUser = Depends(get_current_admin),
):
    participants = db.query(Participant).order_by(desc(Participant.created_at)).all()

    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow([
        "Registration ID",
        "Full Name",
        "Email",
        "Mobile",
        "WhatsApp",
        "City",
        "Gender",
        "Date of Birth",
        "Category",
        "Height",
        "Instagram",
        "Total Fee (INR)",
        "Amount Paid (INR)",
        "Balance Due (INR)",
        "Status",
        "Registration Date",
    ])

    for p in participants:
        writer.writerow([
            p.reg_id,
            p.full_name,
            p.email,
            p.mobile,
            p.whatsapp,
            p.city,
            p.gender,
            p.dob,
            p.category,
            p.height or "",
            p.instagram or "",
            p.total_fee,
            p.amount_paid,
            p.balance_due,
            p.status,
            p.created_at.strftime("%Y-%m-%d %H:%M:%S") if p.created_at else "",
        ])

    output.seek(0)
    filename = f"skyra_participants_{datetime.utcnow().strftime('%Y%m%d_%H%M%S')}.csv"
    return StreamingResponse(
        iter([output.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename={filename}"},
    )

# Static frontend assets and SPA catch-all (Must be last)
FRONTEND_DIST = BASE_DIR.parent / "frontend" / "dist"
if FRONTEND_DIST.exists():
    app.mount("/assets", StaticFiles(directory=str(FRONTEND_DIST / "assets")), name="assets")

    @app.get("/{full_path:path}")
    async def serve_spa(full_path: str):
        if full_path.startswith("api") or full_path.startswith("uploads"):
            raise HTTPException(status_code=404, detail="Not Found")
        target_file = FRONTEND_DIST / full_path
        if target_file.is_file():
            from fastapi.responses import FileResponse
            return FileResponse(str(target_file))
        from fastapi.responses import FileResponse
        return FileResponse(str(FRONTEND_DIST / "index.html"))

