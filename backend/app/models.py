from datetime import datetime
from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from app.database import Base

class Participant(Base):
    __tablename__ = "participants"

    id = Column(Integer, primary_key=True, index=True)
    reg_id = Column(String(50), unique=True, index=True, nullable=False)
    full_name = Column(String(150), nullable=False, index=True)
    email = Column(String(150), nullable=False, index=True)
    dob = Column(String(20), nullable=False)
    gender = Column(String(20), nullable=False)
    mobile = Column(String(25), nullable=False, index=True)
    whatsapp = Column(String(25), nullable=False)
    city = Column(String(100), nullable=False)
    
    # Runway specific details
    category = Column(String(100), default="Runway Model")
    height = Column(String(30), nullable=True)
    instagram = Column(String(150), nullable=True)
    experience = Column(Text, nullable=True)
    
    # Financial fields
    total_fee = Column(Float, default=5000.0)
    amount_paid = Column(Float, default=0.0)
    balance_due = Column(Float, default=5000.0)
    
    # Status: PENDING_VERIFICATION, PARTIALLY_PAID, FULLY_PAID, REJECTED
    status = Column(String(50), default="PENDING_VERIFICATION", index=True)
    
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    payments = relationship("Payment", back_populates="participant", cascade="all, delete-orphan", order_by="desc(Payment.created_at)")

    def recalculate_finances(self):
        """Calculate total verified payments and balance due."""
        verified_sum = sum(p.amount for p in self.payments if p.status == "VERIFIED")
        self.amount_paid = verified_sum
        self.balance_due = max(0.0, (self.total_fee or 5000.0) - verified_sum)
        
        has_pending = any(p.status == "PENDING" for p in self.payments)
        all_rejected = len(self.payments) > 0 and all(p.status == "REJECTED" for p in self.payments)

        if verified_sum >= (self.total_fee or 5000.0):
            self.status = "FULLY_PAID"
        elif verified_sum > 0:
            self.status = "PARTIALLY_PAID"
        elif all_rejected:
            self.status = "REJECTED"
        elif has_pending:
            self.status = "PENDING_VERIFICATION"
        else:
            self.status = "PENDING_VERIFICATION"


class Payment(Base):
    __tablename__ = "payments"

    id = Column(Integer, primary_key=True, index=True)
    payment_id = Column(String(60), unique=True, index=True, nullable=False)
    participant_id = Column(Integer, ForeignKey("participants.id"), nullable=False)
    reg_id = Column(String(50), index=True, nullable=False)
    
    # Payment Type: INITIAL_REGISTRATION or BALANCE_PAYMENT
    payment_type = Column(String(30), nullable=False)
    amount = Column(Float, nullable=False)
    transaction_id = Column(String(100), nullable=False, index=True)
    screenshot_filename = Column(String(255), nullable=False)
    
    # Status: PENDING, VERIFIED, REJECTED
    status = Column(String(30), default="PENDING", index=True)
    rejection_reason = Column(Text, nullable=True)
    verified_by = Column(String(100), nullable=True)
    verified_at = Column(DateTime, nullable=True)
    
    created_at = Column(DateTime, default=datetime.utcnow)

    participant = relationship("Participant", back_populates="payments")


class AdminUser(Base):
    __tablename__ = "admin_users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(50), unique=True, index=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    full_name = Column(String(100), nullable=False)
    role = Column(String(30), default="superadmin")
    created_at = Column(DateTime, default=datetime.utcnow)


class SystemSetting(Base):
    __tablename__ = "system_settings"

    id = Column(Integer, primary_key=True, index=True)
    key = Column(String(100), unique=True, index=True, nullable=False)
    value = Column(Text, nullable=False)
    description = Column(String(255), nullable=True)
