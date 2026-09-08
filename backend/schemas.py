"""
KisanConnect – Pydantic v2 Schemas
"""
from __future__ import annotations
from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, EmailStr, Field, ConfigDict
from backend.models import UserRole, OrderStatus, PaymentStatus, CropCategory, CropApprovalStatus, HandoverMethod


# ──────────────────────── User Schemas ────────────────────────

class UserBase(BaseModel):
    full_name: str = Field(..., min_length=2, max_length=120)
    email: EmailStr
    phone: Optional[str] = None
    role: UserRole = UserRole.CONSUMER
    state: Optional[str] = None
    district: Optional[str] = None
    village: Optional[str] = None
    preferred_language: str = "en"


class UserCreate(UserBase):
    password: str = Field(..., min_length=6)


class UserUpdate(BaseModel):
    full_name: Optional[str] = None
    phone: Optional[str] = None
    state: Optional[str] = None
    district: Optional[str] = None
    village: Optional[str] = None
    profile_image: Optional[str] = None
    preferred_language: Optional[str] = None


class UserRead(UserBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    profile_image: Optional[str] = None
    is_active: bool
    is_verified: bool
    created_at: datetime


# ──────────────────────── Auth Schemas ────────────────────────

class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserRead


# ──────────────────────── Farmer Profile Schemas ────────────────────────

class FarmerProfileBase(BaseModel):
    fpo_name: Optional[str] = None
    is_fpo: bool = False
    organization_name: Optional[str] = None
    land_area_acres: Optional[float] = None
    soil_type: Optional[str] = None
    irrigation_type: Optional[str] = None
    bio: Optional[str] = None
    certifications: List[str] = []
    upi_id: Optional[str] = None


class FarmerProfileCreate(FarmerProfileBase):
    pass


class FarmerProfileRead(FarmerProfileBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    user_id: int
    rating: float
    total_reviews: int
    created_at: datetime


class FarmerWithProfile(UserRead):
    farmer_profile: Optional[FarmerProfileRead] = None


# ──────────────────────── Crop Schemas ────────────────────────

class CropBase(BaseModel):
    name: str = Field(..., min_length=2, max_length=100)
    category: CropCategory
    description: Optional[str] = None
    price_per_kg: float = Field(..., gt=0)
    bulk_price_per_kg: Optional[float] = None
    quantity_kg: float = Field(..., gt=0)
    minimum_order_qty: Optional[float] = None
    available_from: Optional[datetime] = None
    available_until: Optional[datetime] = None
    image_url: Optional[str] = None
    location: Optional[str] = None
    is_organic: bool = False


class CropCreate(CropBase):
    pass


class CropUpdate(BaseModel):
    name: Optional[str] = None
    price_per_kg: Optional[float] = None
    bulk_price_per_kg: Optional[float] = None
    quantity_kg: Optional[float] = None
    minimum_order_qty: Optional[float] = None
    description: Optional[str] = None
    is_available: Optional[bool] = None
    image_url: Optional[str] = None


class CropRead(CropBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    farmer_id: int
    is_available: bool
    approval_status: CropApprovalStatus
    rejection_reason: Optional[str] = None
    created_at: datetime
    farmer: Optional[UserRead] = None


class CropApprovalUpdate(BaseModel):
    status: CropApprovalStatus
    rejection_reason: Optional[str] = None


# ──────────────────────── Order Schemas ────────────────────────

class OrderItemCreate(BaseModel):
    crop_id: int
    quantity_kg: float = Field(..., gt=0)


class OrderItemRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    crop_id: Optional[int]
    quantity_kg: float
    price_per_kg: float
    subtotal: float
    crop: Optional[CropRead] = None


class OrderCreate(BaseModel):
    items: List[OrderItemCreate]
    handover_method: HandoverMethod = HandoverMethod.DELIVERY
    delivery_address: Optional[str] = None
    delivery_latitude: Optional[float] = None
    delivery_longitude: Optional[float] = None
    notes: Optional[str] = None


class OrderStatusUpdate(BaseModel):
    status: OrderStatus


class OrderRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    buyer_id: Optional[int]
    status: OrderStatus
    total_amount: float
    handover_method: HandoverMethod
    pickup_otp: Optional[str]
    delivery_address: Optional[str]
    notes: Optional[str]
    created_at: datetime
    updated_at: datetime
    items: List[OrderItemRead] = []
    buyer: Optional[UserRead] = None


# ──────────────────────── Payment Schemas ────────────────────────

class PaymentCreate(BaseModel):
    order_id: int
    method: str = "UPI"


class PaymentConfirm(BaseModel):
    payment_id: int
    transaction_id: str


class PaymentRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    order_id: int
    amount: float
    method: str
    status: PaymentStatus
    transaction_id: Optional[str]
    created_at: datetime


# ──────────────────────── Message Schemas ────────────────────────

class MessageCreate(BaseModel):
    receiver_id: int
    content: str = Field(..., min_length=1)


class MessageRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    sender_id: int
    receiver_id: int
    content: str
    is_read: bool
    created_at: datetime
    sender: Optional[UserRead] = None
    receiver: Optional[UserRead] = None


# ──────────────────────── Feedback Schemas ────────────────────────

class FeedbackCreate(BaseModel):
    farmer_id: int
    crop_id: Optional[int] = None
    rating: int = Field(..., ge=1, le=5)
    comment: Optional[str] = None


class FeedbackRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    reviewer_id: int
    farmer_id: int
    crop_id: Optional[int]
    rating: int
    comment: Optional[str]
    created_at: datetime
    reviewer: Optional[UserRead] = None


# ──────────────────────── AI Schemas ────────────────────────

class CropRecommendRequest(BaseModel):
    nitrogen: float = Field(..., ge=0, le=200, description="N content in soil (kg/ha)")
    phosphorus: float = Field(..., ge=0, le=200, description="P content in soil (kg/ha)")
    potassium: float = Field(..., ge=0, le=200, description="K content in soil (kg/ha)")
    ph: float = Field(..., ge=0, le=14, description="Soil pH")
    rainfall: float = Field(..., ge=0, description="Annual rainfall (mm)")
    temperature: float = Field(..., description="Avg temperature (°C)")
    humidity: Optional[float] = Field(None, ge=0, le=100)


class CropRecommendResponse(BaseModel):
    recommendations: List[dict]
    model_confidence: float
    input_summary: dict


class DemandForecastRequest(BaseModel):
    crop_name: str
    days: int = Field(default=30, ge=7, le=365)


class DemandForecastResponse(BaseModel):
    crop_name: str
    forecast: List[dict]
    trend: str
    avg_price: float


class RouteOptimizeRequest(BaseModel):
    origin: dict  # {lat, lng, name}
    destinations: List[dict]  # [{lat, lng, name}]


class RouteOptimizeResponse(BaseModel):
    optimized_route: List[dict]
    total_distance_km: float
    estimated_time_hours: float


# ──────────────────────── Generic Schemas ────────────────────────

class PaginatedResponse(BaseModel):
    total: int
    page: int
    size: int
    items: list


class MessageResponse(BaseModel):
    message: str
    success: bool = True
