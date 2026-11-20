from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, EmailStr, Field, ConfigDict

class PaymentResponse(BaseModel):
    id: int
    payment_id: str
    reg_id: str
    payment_type: str
    amount: float
    transaction_id: str
    screenshot_url: str
    status: str
    rejection_reason: Optional[str] = None
    verified_by: Optional[str] = None
    verified_at: Optional[datetime] = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class ParticipantBase(BaseModel):
    full_name: str
    email: EmailStr
    dob: str
    gender: str
    mobile: str
    whatsapp: str
    city: str
    category: Optional[str] = "Runway Model"
    height: Optional[str] = None
    instagram: Optional[str] = None
    experience: Optional[str] = None


class ParticipantResponse(ParticipantBase):
    id: int
    reg_id: str
    total_fee: float
    amount_paid: float
    balance_due: float
    status: str
    created_at: datetime
    updated_at: datetime
    payments: List[PaymentResponse] = []

    model_config = ConfigDict(from_attributes=True)


class ParticipantLookupResponse(BaseModel):
    reg_id: str
    full_name: str
    email: str
    mobile: str
    whatsapp: str
    city: str
    category: str
    status: str
    total_fee: float
    amount_paid: float
    balance_due: float
    payments: List[PaymentResponse] = []


class VerificationRequest(BaseModel):
    action: str = Field(..., description="'VERIFY' or 'REJECT'")
    rejection_reason: Optional[str] = None


class AdminLoginRequest(BaseModel):
    username: str
    password: str


class AdminLoginResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    admin: dict


class StatsResponse(BaseModel):
    total_participants: int
    total_verified_revenue: float
    total_pending_amount: float
    total_balance_due: float
    pending_verifications_count: int
    verified_participants_count: int
    partially_paid_count: int
    fully_paid_count: int
    rejected_count: int


class PaymentInfoResponse(BaseModel):
    event_name: str
    upi_id: str
    upi_name: str
    default_total_fee: float
    allowed_balance_amounts: List[int]
    qr_code_url: str
