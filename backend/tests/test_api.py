import os
import io
import uuid
import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.database import Base, engine, SessionLocal
from app.models import Participant, Payment, AdminUser
from app.seed import seed_database

client = TestClient(app)

@pytest.fixture(autouse=True)
def setup_db():
    seed_database()
    yield

def test_payment_info():
    response = client.get("/api/payment-info")
    assert response.status_code == 200
    data = response.json()
    assert "event_name" in data
    assert data["upi_id"] == "mr.death4646@oksbi"
    assert data["upi_name"] == "Sanjay Mass"
    assert 500 in data["allowed_balance_amounts"]
    assert 3500 in data["allowed_balance_amounts"]

def test_participant_lookup():
    # Ananya Sharma was seeded with SC-2026-1001
    response = client.get("/api/participant/lookup/SC-2026-1001")
    assert response.status_code == 200
    data = response.json()
    assert data["full_name"] == "Ananya Sharma"
    assert data["status"] == "FULLY_PAID"
    assert data["balance_due"] == 0.0

def test_new_registration_and_balance_flow():
    # 1. Register a new participant with unique email/phone
    test_id = uuid.uuid4().hex[:6]
    test_image_bytes = b"fake image bytes for payment screenshot"
    file = ("screenshot.png", io.BytesIO(test_image_bytes), "image/png")
    
    reg_payload = {
        "full_name": f"Kavya {test_id.upper()}",
        "email": f"kavya.{test_id}@testmail.com",
        "dob": "10-05-2001",
        "gender": "Female",
        "mobile": f"+9199{uuid.uuid4().int % 100000000:08d}",
        "whatsapp": f"+9199{uuid.uuid4().int % 100000000:08d}",
        "city": "Mumbai",
        "category": "Runway Model",
        "height": "5ft 8in",
        "instagram": f"@kavya_{test_id}",
        "experience": "LFW fresher",
        "amount": 2000.0,
        "transaction_id": f"UTR_{test_id}",
        "terms_confirmed": True,
    }
    
    response = client.post("/api/register", data=reg_payload, files={"screenshot": file})
    assert response.status_code == 200
    res_data = response.json()
    assert res_data["success"] is True
    reg_id = res_data["reg_id"]
    assert reg_id.startswith("SC-2026-")
    
    # 2. Check participant lookup
    lookup_res = client.get(f"/api/participant/lookup/{reg_id}")
    assert lookup_res.status_code == 200
    lookup_data = lookup_res.json()
    assert lookup_data["status"] == "PENDING_VERIFICATION"
    assert lookup_data["total_fee"] == 5000.0
    assert lookup_data["amount_paid"] == 0.0
    assert lookup_data["balance_due"] == 5000.0
    assert len(lookup_data["payments"]) == 1
    
    initial_pay_id = lookup_data["payments"][0]["payment_id"]
    
    # 3. Admin Login
    login_res = client.post("/api/admin/login", json={"username": "admin", "password": "SkyraAdmin@2026"})
    assert login_res.status_code == 200
    token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}
    
    # 4. Admin verifies the initial 2000 payment
    verify_res = client.post(
        f"/api/admin/payments/{initial_pay_id}/verify",
        json={"action": "VERIFY"},
        headers=headers,
    )
    assert verify_res.status_code == 200
    assert verify_res.json()["payment"]["status"] == "VERIFIED"
    assert verify_res.json()["participant"]["amount_paid"] == 2000.0
    assert verify_res.json()["participant"]["balance_due"] == 3000.0
    assert verify_res.json()["participant"]["status"] == "PARTIALLY_PAID"
    
    # 5. Participant submits balance payment of remaining 3000
    bal_file = ("balance_screen.png", io.BytesIO(b"second screenshot bytes"), "image/png")
    bal_payload = {
        "reg_id": reg_id,
        "full_name": "Kavya Patel",
        "amount": 3000.0,
        "transaction_id": "TEST_UTR_BALANCE_999",
        "terms_confirmed": True,
    }
    bal_res = client.post("/api/balance-payment", data=bal_payload, files={"screenshot": bal_file})
    assert bal_res.status_code == 200
    bal_data = bal_res.json()
    assert bal_data["success"] is True
    bal_pay_id = bal_data["payment_id"]
    
    # 6. Admin verifies the balance payment
    verify_bal_res = client.post(
        f"/api/admin/payments/{bal_pay_id}/verify",
        json={"action": "VERIFY"},
        headers=headers,
    )
    assert verify_bal_res.status_code == 200
    assert verify_bal_res.json()["participant"]["amount_paid"] == 5000.0
    assert verify_bal_res.json()["participant"]["balance_due"] == 0.0
    assert verify_bal_res.json()["participant"]["status"] == "FULLY_PAID"
    
    # 7. Check Digital Pass
    pass_res = client.get(f"/api/participant/{reg_id}/pass")
    assert pass_res.status_code == 200
    pass_data = pass_res.json()
    assert pass_data["entry_allowed"] is True
    assert pass_data["status"] == "FULLY_PAID"

def test_admin_stats_and_export():
    login_res = client.post("/api/admin/login", json={"username": "admin", "password": "SkyraAdmin@2026"})
    token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}
    
    stats_res = client.get("/api/admin/stats", headers=headers)
    assert stats_res.status_code == 200
    stats = stats_res.json()
    assert stats["total_participants"] >= 3
    assert stats["total_verified_revenue"] > 0
    
    export_res = client.get("/api/admin/export", headers=headers)
    assert export_res.status_code == 200
    assert "Registration ID" in export_res.text
    assert "Full Name" in export_res.text
