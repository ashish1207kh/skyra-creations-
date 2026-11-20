import os
from datetime import datetime, timedelta
from app.database import SessionLocal, engine, Base
from app.models import AdminUser, Participant, Payment, SystemSetting
from app.auth import hash_password
from app.config import (
    DEFAULT_EVENT_NAME,
    DEFAULT_TOTAL_FEE,
    DEFAULT_UPI_ID,
    DEFAULT_UPI_NAME,
    DEFAULT_WHATSAPP_SUPPORT,
)

def seed_database():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    try:
        # 1. Seed Admin
        admin = db.query(AdminUser).filter(AdminUser.username == "admin").first()
        if not admin:
            admin = AdminUser(
                username="admin",
                password_hash=hash_password("SkyraAdmin@2026"),
                full_name="Skyra Creations Director",
                role="superadmin",
            )
            db.add(admin)
            print("Seeded default admin user: admin / SkyraAdmin@2026")

        # 2. Seed System Settings
        settings_data = [
            ("event_name", DEFAULT_EVENT_NAME, "Official Runway Show Title"),
            ("total_fee", str(DEFAULT_TOTAL_FEE), "Total standard registration fee in INR"),
            ("upi_id", DEFAULT_UPI_ID, "UPI Virtual Payment Address for QR Code"),
            ("upi_name", DEFAULT_UPI_NAME, "Account holder name for UPI payments"),
            ("whatsapp_support", DEFAULT_WHATSAPP_SUPPORT, "WhatsApp contact number for participants"),
        ]

        for k, v, d in settings_data:
            setting = db.query(SystemSetting).filter(SystemSetting.key == k).first()
            if not setting:
                setting = SystemSetting(key=k, value=v, description=d)
                db.add(setting)

        # 3. Seed Sample Participants if empty
        existing_count = db.query(Participant).count()
        if existing_count == 0:
            sample_participants = [
                {
                    "reg_id": "SC-2026-1001",
                    "full_name": "Ananya Sharma",
                    "email": "ananya.sharma@example.com",
                    "dob": "14-07-2002",
                    "gender": "Female",
                    "mobile": "+919840123456",
                    "whatsapp": "+919840123456",
                    "city": "Chennai",
                    "category": "Runway Model",
                    "height": "5ft 9in",
                    "instagram": "@ananya_runway",
                    "experience": "Walked in Chennai Fashion Week 2025",
                    "total_fee": 5000.0,
                    "payments": [
                        {
                            "payment_id": "PAY-2026-001A",
                            "payment_type": "INITIAL_REGISTRATION",
                            "amount": 2500.0,
                            "transaction_id": "UPI/428901823901",
                            "status": "VERIFIED",
                            "screenshot_filename": "sample_receipt_1.png",
                        },
                        {
                            "payment_id": "PAY-2026-001B",
                            "payment_type": "BALANCE_PAYMENT",
                            "amount": 2500.0,
                            "transaction_id": "UPI/428999482103",
                            "status": "VERIFIED",
                            "screenshot_filename": "sample_receipt_2.png",
                        }
                    ]
                },
                {
                    "reg_id": "SC-2026-1002",
                    "full_name": "Rohan Verma",
                    "email": "rohan.v@example.com",
                    "dob": "22-11-2001",
                    "gender": "Male",
                    "mobile": "+919712345678",
                    "whatsapp": "+919712345678",
                    "city": "Bengaluru",
                    "category": "Runway Model",
                    "height": "6ft 1in",
                    "instagram": "@rohan_v_style",
                    "experience": "College pageant winner",
                    "total_fee": 5000.0,
                    "payments": [
                        {
                            "payment_id": "PAY-2026-002A",
                            "payment_type": "INITIAL_REGISTRATION",
                            "amount": 2000.0,
                            "transaction_id": "UPI/429103948572",
                            "status": "VERIFIED",
                            "screenshot_filename": "sample_receipt_3.png",
                        }
                    ]
                },
                {
                    "reg_id": "SC-2026-1003",
                    "full_name": "Meera Krishnan",
                    "email": "meera.krish@example.com",
                    "dob": "05-03-2003",
                    "gender": "Female",
                    "mobile": "+919445123987",
                    "whatsapp": "+919445123987",
                    "city": "Coimbatore",
                    "category": "Teen / Fresher Runway",
                    "height": "5ft 7in",
                    "instagram": "@meera.k_fashion",
                    "experience": "Fresher looking for first runway launch",
                    "total_fee": 5000.0,
                    "payments": [
                        {
                            "payment_id": "PAY-2026-003A",
                            "payment_type": "INITIAL_REGISTRATION",
                            "amount": 1500.0,
                            "transaction_id": "UPI/430019283741",
                            "status": "PENDING",
                            "screenshot_filename": "sample_receipt_4.png",
                        }
                    ]
                }
            ]

            for sp in sample_participants:
                payments_data = sp.pop("payments")
                p = Participant(**sp)
                db.add(p)
                db.flush()

                for pay_data in payments_data:
                    pay = Payment(
                        participant_id=p.id,
                        reg_id=p.reg_id,
                        payment_id=pay_data["payment_id"],
                        payment_type=pay_data["payment_type"],
                        amount=pay_data["amount"],
                        transaction_id=pay_data["transaction_id"],
                        screenshot_filename=pay_data["screenshot_filename"],
                        status=pay_data["status"],
                        verified_by="System" if pay_data["status"] == "VERIFIED" else None,
                        verified_at=datetime.utcnow() if pay_data["status"] == "VERIFIED" else None,
                    )
                    db.add(pay)

                db.flush()
                p.recalculate_finances()

            print("Seeded sample runway participants.")

        db.commit()
    except Exception as e:
        db.rollback()
        print(f"Error during seeding: {e}")
        raise
    finally:
        db.close()

if __name__ == "__main__":
    seed_database()
