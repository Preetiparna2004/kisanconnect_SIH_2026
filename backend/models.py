"""
KisanConnect – SQLAlchemy ORM Models
"""
import enum
from datetime import datetime
from sqlalchemy import (
    Column, Integer, String, Float, Boolean, DateTime,
    ForeignKey, Enum, Text, JSON
)
from sqlalchemy.orm import relationship
from backend.database import Base


# ──────────────────────────── Enumerations ────────────────────────────

class UserRole(str, enum.Enum):
    FARMER = "FARMER"
    FPO = "FPO"
    CONSUMER = "CONSUMER"
    BULK_BUYER = "BULK_BUYER"
    ADMIN = "ADMIN"


class HandoverMethod(str, enum.Enum):
    DELIVERY = "DELIVERY"
    PICKUP = "PICKUP"


class OrderStatus(str, enum.Enum):
    PLACED = "PLACED"
    CONFIRMED = "CONFIRMED"
    PACKED = "PACKED"
    SHIPPED = "SHIPPED"
    DELIVERED = "DELIVERED"
    CANCELLED = "CANCELLED"


class PaymentStatus(str, enum.Enum):
    PENDING = "PENDING"
    COMPLETED = "COMPLETED"
    FAILED = "FAILED"
    REFUNDED = "REFUNDED"


class CropCategory(str, enum.Enum):
    CEREALS = "CEREALS"
    PULSES = "PULSES"
    VEGETABLES = "VEGETABLES"
    FRUITS = "FRUITS"
    SPICES = "SPICES"
    OILSEEDS = "OILSEEDS"
    CASH_CROPS = "CASH_CROPS"


class CropApprovalStatus(str, enum.Enum):
    PENDING = "PENDING"
    APPROVED = "APPROVED"
    REJECTED = "REJECTED"


# ──────────────────────────── Models ────────────────────────────

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    full_name = Column(String(120), nullable=False)
    email = Column(String(120), unique=True, index=True, nullable=False)
    phone = Column(String(15), nullable=True)  # Not unique — optional field
    hashed_password = Column(String(255), nullable=False)
    role = Column(Enum(UserRole), default=UserRole.CONSUMER, nullable=False)
    state = Column(String(60), nullable=True)
    district = Column(String(60), nullable=True)
    village = Column(String(80), nullable=True)
    profile_image = Column(String(255), nullable=True)
    is_active = Column(Boolean, default=True)
    is_verified = Column(Boolean, default=False)
    preferred_language = Column(String(5), default="en")
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    crops = relationship("Crop", back_populates="farmer", cascade="all, delete-orphan")
    orders_as_buyer = relationship("Order", back_populates="buyer", foreign_keys="Order.buyer_id")
    sent_messages = relationship("Message", back_populates="sender", foreign_keys="Message.sender_id")
    received_messages = relationship("Message", back_populates="receiver", foreign_keys="Message.receiver_id")
    feedbacks_given = relationship("Feedback", back_populates="reviewer", foreign_keys="Feedback.reviewer_id")
    feedbacks_received = relationship("Feedback", back_populates="farmer", foreign_keys="Feedback.farmer_id")


class FarmerProfile(Base):
    """Extended profile for Farmer role users."""
    __tablename__ = "farmer_profiles"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), unique=True)
    fpo_name = Column(String(120), nullable=True)
    is_fpo = Column(Boolean, default=False)
    organization_name = Column(String(120), nullable=True)
    land_area_acres = Column(Float, nullable=True)
    soil_type = Column(String(60), nullable=True)
    irrigation_type = Column(String(60), nullable=True)
    bio = Column(Text, nullable=True)
    certifications = Column(JSON, default=list)  # ["Organic", "GAP"]
    bank_account = Column(String(20), nullable=True)
    upi_id = Column(String(80), nullable=True)
    rating = Column(Float, default=0.0)
    total_reviews = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", backref="farmer_profile")


class Crop(Base):
    __tablename__ = "crops"

    id = Column(Integer, primary_key=True, index=True)
    farmer_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    name = Column(String(100), nullable=False)
    category = Column(Enum(CropCategory), nullable=False)
    description = Column(Text, nullable=True)
    price_per_kg = Column(Float, nullable=False)
    bulk_price_per_kg = Column(Float, nullable=True)
    quantity_kg = Column(Float, nullable=False)
    minimum_order_qty = Column(Float, nullable=True)
    available_from = Column(DateTime, nullable=True)
    available_until = Column(DateTime, nullable=True)
    image_url = Column(String(500), nullable=True)
    location = Column(String(120), nullable=True)
    is_organic = Column(Boolean, default=False)
    is_available = Column(Boolean, default=True)
    approval_status = Column(Enum(CropApprovalStatus), default=CropApprovalStatus.PENDING, nullable=False)
    rejection_reason = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    farmer = relationship("User", back_populates="crops")
    order_items = relationship("OrderItem", back_populates="crop")


class Order(Base):
    __tablename__ = "orders"

    id = Column(Integer, primary_key=True, index=True)
    buyer_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    status = Column(Enum(OrderStatus), default=OrderStatus.PLACED)
    total_amount = Column(Float, nullable=False)
    handover_method = Column(Enum(HandoverMethod), default=HandoverMethod.DELIVERY)
    pickup_otp = Column(String(10), nullable=True)
    delivery_address = Column(Text, nullable=True)
    delivery_latitude = Column(Float, nullable=True)
    delivery_longitude = Column(Float, nullable=True)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    buyer = relationship("User", back_populates="orders_as_buyer", foreign_keys=[buyer_id])
    items = relationship("OrderItem", back_populates="order", cascade="all, delete-orphan")
    payment = relationship("Payment", back_populates="order", uselist=False)


class OrderItem(Base):
    __tablename__ = "order_items"

    id = Column(Integer, primary_key=True, index=True)
    order_id = Column(Integer, ForeignKey("orders.id", ondelete="CASCADE"))
    crop_id = Column(Integer, ForeignKey("crops.id", ondelete="SET NULL"), nullable=True)
    quantity_kg = Column(Float, nullable=False)
    price_per_kg = Column(Float, nullable=False)
    subtotal = Column(Float, nullable=False)

    order = relationship("Order", back_populates="items")
    crop = relationship("Crop", back_populates="order_items")


class Payment(Base):
    __tablename__ = "payments"

    id = Column(Integer, primary_key=True, index=True)
    order_id = Column(Integer, ForeignKey("orders.id", ondelete="CASCADE"), unique=True)
    amount = Column(Float, nullable=False)
    method = Column(String(30), default="UPI")  # UPI, BANK_TRANSFER, COD
    status = Column(Enum(PaymentStatus), default=PaymentStatus.PENDING)
    transaction_id = Column(String(100), nullable=True)
    gateway_response = Column(JSON, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    order = relationship("Order", back_populates="payment")


class Message(Base):
    __tablename__ = "messages"

    id = Column(Integer, primary_key=True, index=True)
    sender_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"))
    receiver_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"))
    content = Column(Text, nullable=False)
    is_read = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    sender = relationship("User", back_populates="sent_messages", foreign_keys=[sender_id])
    receiver = relationship("User", back_populates="received_messages", foreign_keys=[receiver_id])


class Feedback(Base):
    __tablename__ = "feedback"

    id = Column(Integer, primary_key=True, index=True)
    reviewer_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"))
    farmer_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"))
    crop_id = Column(Integer, ForeignKey("crops.id", ondelete="SET NULL"), nullable=True)
    rating = Column(Integer, nullable=False)  # 1–5
    comment = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    reviewer = relationship("User", back_populates="feedbacks_given", foreign_keys=[reviewer_id])
    farmer = relationship("User", back_populates="feedbacks_received", foreign_keys=[farmer_id])
