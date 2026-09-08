"""
KisanConnect – Orders Routes
Order placement, status workflow, buyer/farmer views
"""
from datetime import datetime
import random
import string
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from backend.database import get_db
from backend import models, schemas
from backend.routes.auth import get_current_user, require_role

router = APIRouter()


@router.post("/", response_model=schemas.OrderRead, status_code=201)
def place_order(
    payload: schemas.OrderCreate,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    total = 0.0
    items_data = []

    for item in payload.items:
        crop = db.query(models.Crop).filter(
            models.Crop.id == item.crop_id,
            models.Crop.is_available == True,
        ).first()
        if not crop:
            raise HTTPException(status_code=404, detail=f"Crop {item.crop_id} not found or unavailable")
        if crop.quantity_kg < item.quantity_kg:
            raise HTTPException(status_code=400, detail=f"Insufficient stock for {crop.name}")

        subtotal = round(crop.price_per_kg * item.quantity_kg, 2)
        total += subtotal
        items_data.append({
            "crop": crop,
            "quantity_kg": item.quantity_kg,
            "price_per_kg": crop.price_per_kg,
            "subtotal": subtotal,
        })

    pickup_otp = None
    if payload.handover_method == models.HandoverMethod.PICKUP:
        pickup_otp = "".join(random.choices(string.digits, k=4))

    order = models.Order(
        buyer_id=current_user.id,
        total_amount=round(total, 2),
        handover_method=payload.handover_method,
        pickup_otp=pickup_otp,
        delivery_address=payload.delivery_address if payload.handover_method == models.HandoverMethod.DELIVERY else None,
        delivery_latitude=payload.delivery_latitude if payload.handover_method == models.HandoverMethod.DELIVERY else None,
        delivery_longitude=payload.delivery_longitude if payload.handover_method == models.HandoverMethod.DELIVERY else None,
        notes=payload.notes,
    )
    db.add(order)
    db.flush()

    for item_data in items_data:
        oi = models.OrderItem(
            order_id=order.id,
            crop_id=item_data["crop"].id,
            quantity_kg=item_data["quantity_kg"],
            price_per_kg=item_data["price_per_kg"],
            subtotal=item_data["subtotal"],
        )
        db.add(oi)
        # Deduct stock
        item_data["crop"].quantity_kg -= item_data["quantity_kg"]
        if item_data["crop"].quantity_kg <= 0:
            item_data["crop"].is_available = False

    db.commit()
    db.refresh(order)
    return order


@router.get("/my", response_model=List[schemas.OrderRead])
def my_orders(
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return db.query(models.Order).filter(
        models.Order.buyer_id == current_user.id
    ).order_by(models.Order.created_at.desc()).all()


@router.get("/farmer/incoming", response_model=List[schemas.OrderRead])
def farmer_incoming_orders(
    current_user: models.User = Depends(require_role(models.UserRole.FARMER)),
    db: Session = Depends(get_db),
):
    """Orders containing crops from this farmer."""
    return (
        db.query(models.Order)
        .join(models.OrderItem)
        .join(models.Crop)
        .filter(models.Crop.farmer_id == current_user.id)
        .distinct()
        .order_by(models.Order.created_at.desc())
        .all()
    )


@router.get("/{order_id}", response_model=schemas.OrderRead)
def get_order(
    order_id: int,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    order = db.query(models.Order).filter(models.Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    if order.buyer_id != current_user.id and current_user.role != models.UserRole.ADMIN:
        # Check if farmer owns any crop in order
        farmer_crops = db.query(models.Crop).filter(models.Crop.farmer_id == current_user.id).all()
        farmer_crop_ids = {c.id for c in farmer_crops}
        order_crop_ids = {i.crop_id for i in order.items}
        if not farmer_crop_ids & order_crop_ids:
            raise HTTPException(status_code=403, detail="Access denied")
    return order


@router.put("/{order_id}/status", response_model=schemas.OrderRead)
def update_order_status(
    order_id: int,
    payload: schemas.OrderStatusUpdate,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    order = db.query(models.Order).filter(models.Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    order.status = payload.status
    order.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(order)
    return order


@router.get("/", response_model=List[schemas.OrderRead])
def list_all_orders(
    skip: int = 0,
    limit: int = 50,
    current_user: models.User = Depends(require_role(models.UserRole.ADMIN)),
    db: Session = Depends(get_db),
):
    return db.query(models.Order).offset(skip).limit(limit).all()
