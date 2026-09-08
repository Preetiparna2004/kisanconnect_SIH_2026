"""
KisanConnect – Admin Routes
Platform management: pending crops, user list, stats
All endpoints require ADMIN role.
"""
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List

from backend.database import get_db
from backend import models, schemas
from backend.routes.auth import require_role

router = APIRouter()


@router.get("/stats")
def admin_stats(
    current_user: models.User = Depends(require_role(models.UserRole.ADMIN)),
    db: Session = Depends(get_db),
):
    """Platform-wide aggregate stats."""
    total_users   = db.query(models.User).count()
    total_farmers = db.query(models.User).filter(models.User.role == models.UserRole.FARMER).count()
    total_buyers  = db.query(models.User).filter(models.User.role == models.UserRole.BUYER).count()
    total_crops   = db.query(models.Crop).count()
    pending_crops = db.query(models.Crop).filter(
        models.Crop.approval_status == models.CropApprovalStatus.PENDING
    ).count()
    approved_crops = db.query(models.Crop).filter(
        models.Crop.approval_status == models.CropApprovalStatus.APPROVED
    ).count()
    total_orders  = db.query(models.Order).count()

    return {
        "total_users": total_users,
        "total_farmers": total_farmers,
        "total_buyers": total_buyers,
        "total_crops": total_crops,
        "pending_crops": pending_crops,
        "approved_crops": approved_crops,
        "total_orders": total_orders,
    }


@router.get("/crops/pending", response_model=List[schemas.CropRead])
def pending_crops(
    current_user: models.User = Depends(require_role(models.UserRole.ADMIN)),
    db: Session = Depends(get_db),
):
    """All crops awaiting admin review."""
    return (
        db.query(models.Crop)
        .filter(models.Crop.approval_status == models.CropApprovalStatus.PENDING)
        .order_by(models.Crop.created_at.asc())
        .all()
    )


@router.get("/crops/all", response_model=List[schemas.CropRead])
def all_crops(
    current_user: models.User = Depends(require_role(models.UserRole.ADMIN)),
    db: Session = Depends(get_db),
):
    """All crops (any status) — for admin overview."""
    return db.query(models.Crop).order_by(models.Crop.created_at.desc()).all()


@router.get("/users", response_model=List[schemas.UserRead])
def all_users(
    current_user: models.User = Depends(require_role(models.UserRole.ADMIN)),
    db: Session = Depends(get_db),
):
    """List all registered users."""
    return db.query(models.User).order_by(models.User.created_at.desc()).all()


@router.patch("/users/{user_id}/toggle-active", response_model=schemas.UserRead)
def toggle_user_active(
    user_id: int,
    current_user: models.User = Depends(require_role(models.UserRole.ADMIN)),
    db: Session = Depends(get_db),
):
    """Activate or deactivate a user account."""
    from fastapi import HTTPException
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    user.is_active = not user.is_active
    db.commit()
    db.refresh(user)
    return user
