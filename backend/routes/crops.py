"""
KisanConnect – Crops Routes
Full CRUD for crop listings with approval workflow
"""
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional

from backend.database import get_db
from backend import models, schemas
from backend.routes.auth import get_current_user, require_role

router = APIRouter()


@router.get("/", response_model=List[schemas.CropRead])
def list_crops(
    skip: int = 0,
    limit: int = 30,
    category: Optional[models.CropCategory] = None,
    search: Optional[str] = Query(None),
    is_organic: Optional[bool] = None,
    min_price: Optional[float] = None,
    max_price: Optional[float] = None,
    db: Session = Depends(get_db),
):
    """Public marketplace — only shows APPROVED crops."""
    query = db.query(models.Crop).filter(
        models.Crop.is_available == True,
        models.Crop.approval_status == models.CropApprovalStatus.APPROVED,
    )
    if category:
        query = query.filter(models.Crop.category == category)
    if search:
        query = query.filter(models.Crop.name.ilike(f"%{search}%"))
    if is_organic is not None:
        query = query.filter(models.Crop.is_organic == is_organic)
    if min_price is not None:
        query = query.filter(models.Crop.price_per_kg >= min_price)
    if max_price is not None:
        query = query.filter(models.Crop.price_per_kg <= max_price)
    return query.order_by(models.Crop.created_at.desc()).offset(skip).limit(limit).all()


@router.post("/", response_model=schemas.CropRead, status_code=201)
def create_crop(
    payload: schemas.CropCreate,
    current_user: models.User = Depends(require_role(models.UserRole.FARMER)),
    db: Session = Depends(get_db),
):
    """Create a new crop listing — starts as PENDING approval."""
    crop = models.Crop(
        **payload.model_dump(),
        farmer_id=current_user.id,
        approval_status=models.CropApprovalStatus.PENDING,
        is_available=False,  # Not available until approved
    )
    db.add(crop)
    db.commit()
    db.refresh(crop)
    return crop


@router.get("/my/listings", response_model=List[schemas.CropRead])
def my_crops(
    current_user: models.User = Depends(require_role(models.UserRole.FARMER)),
    db: Session = Depends(get_db),
):
    """Farmer sees ALL their crops with approval status."""
    return db.query(models.Crop).filter(
        models.Crop.farmer_id == current_user.id
    ).order_by(models.Crop.created_at.desc()).all()


@router.get("/{crop_id}", response_model=schemas.CropRead)
def get_crop(crop_id: int, db: Session = Depends(get_db)):
    crop = db.query(models.Crop).filter(models.Crop.id == crop_id).first()
    if not crop:
        raise HTTPException(status_code=404, detail="Crop not found")
    return crop


@router.put("/{crop_id}", response_model=schemas.CropRead)
def update_crop(
    crop_id: int,
    payload: schemas.CropUpdate,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    crop = db.query(models.Crop).filter(models.Crop.id == crop_id).first()
    if not crop:
        raise HTTPException(status_code=404, detail="Crop not found")
    if crop.farmer_id != current_user.id and current_user.role != models.UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Not authorized")

    for field, value in payload.model_dump(exclude_none=True).items():
        setattr(crop, field, value)
    crop.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(crop)
    return crop


@router.patch("/{crop_id}/approval", response_model=schemas.CropRead)
def update_crop_approval(
    crop_id: int,
    payload: schemas.CropApprovalUpdate,
    current_user: models.User = Depends(require_role(models.UserRole.ADMIN)),
    db: Session = Depends(get_db),
):
    """Admin-only: Approve or Reject a crop listing."""
    crop = db.query(models.Crop).filter(models.Crop.id == crop_id).first()
    if not crop:
        raise HTTPException(status_code=404, detail="Crop not found")

    crop.approval_status = payload.status
    crop.rejection_reason = payload.rejection_reason

    # Automatically make available when approved, hide when rejected
    if payload.status == models.CropApprovalStatus.APPROVED:
        crop.is_available = True
    else:
        crop.is_available = False

    crop.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(crop)
    return crop


@router.delete("/{crop_id}", response_model=schemas.MessageResponse)
def delete_crop(
    crop_id: int,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    crop = db.query(models.Crop).filter(models.Crop.id == crop_id).first()
    if not crop:
        raise HTTPException(status_code=404, detail="Crop not found")
    if crop.farmer_id != current_user.id and current_user.role != models.UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Not authorized")
    db.delete(crop)
    db.commit()
    return {"message": "Crop deleted successfully"}
