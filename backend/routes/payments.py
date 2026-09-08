"""
KisanConnect – Payments Routes
Mock payment intent, confirmation, and status check
"""
import uuid
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from backend.database import get_db
from backend import models, schemas
from backend.routes.auth import get_current_user

router = APIRouter()


@router.post("/initiate", response_model=schemas.PaymentRead, status_code=201)
def initiate_payment(
    payload: schemas.PaymentCreate,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    order = db.query(models.Order).filter(models.Order.id == payload.order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    if order.buyer_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not your order")

    # Check for existing payment
    existing = db.query(models.Payment).filter(models.Payment.order_id == order.id).first()
    if existing and existing.status == models.PaymentStatus.COMPLETED:
        raise HTTPException(status_code=400, detail="Order already paid")

    payment = models.Payment(
        order_id=order.id,
        amount=order.total_amount,
        method=payload.method,
        status=models.PaymentStatus.PENDING,
        gateway_response={"mock_payment_id": str(uuid.uuid4()), "redirect_url": "#"},
    )
    db.add(payment)
    db.commit()
    db.refresh(payment)
    return payment


@router.post("/confirm", response_model=schemas.PaymentRead)
def confirm_payment(
    payload: schemas.PaymentConfirm,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    payment = db.query(models.Payment).filter(models.Payment.id == payload.payment_id).first()
    if not payment:
        raise HTTPException(status_code=404, detail="Payment not found")

    payment.status = models.PaymentStatus.COMPLETED
    payment.transaction_id = payload.transaction_id

    # Update order status
    order = payment.order
    order.status = models.OrderStatus.CONFIRMED

    db.commit()
    db.refresh(payment)
    return payment


@router.get("/{payment_id}", response_model=schemas.PaymentRead)
def get_payment(
    payment_id: int,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    payment = db.query(models.Payment).filter(models.Payment.id == payment_id).first()
    if not payment:
        raise HTTPException(status_code=404, detail="Payment not found")
    return payment
