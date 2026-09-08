"""
KisanConnect – Farmers Routes
GET /  (list all farmers), GET /{id}, PUT /{id}/profile
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from backend.database import get_db
from backend import models, schemas
from backend.routes.auth import get_current_user, require_role

router = APIRouter()


@router.get("/", response_model=List[schemas.FarmerWithProfile])
def list_farmers(
    skip: int = 0,
    limit: int = 20,
    state: str = None,
    db: Session = Depends(get_db),
):
    query = db.query(models.User).filter(models.User.role == models.UserRole.FARMER, models.User.is_active == True)
    if state:
        query = query.filter(models.User.state.ilike(f"%{state}%"))
    return query.offset(skip).limit(limit).all()


@router.get("/{farmer_id}", response_model=schemas.FarmerWithProfile)
def get_farmer(farmer_id: int, db: Session = Depends(get_db)):
    farmer = db.query(models.User).filter(
        models.User.id == farmer_id,
        models.User.role == models.UserRole.FARMER,
    ).first()
    if not farmer:
        raise HTTPException(status_code=404, detail="Farmer not found")
    return farmer


@router.get("/{farmer_id}/crops", response_model=List[schemas.CropRead])
def get_farmer_crops(farmer_id: int, db: Session = Depends(get_db)):
    farmer = db.query(models.User).filter(models.User.id == farmer_id).first()
    if not farmer:
        raise HTTPException(status_code=404, detail="Farmer not found")
    return db.query(models.Crop).filter(
        models.Crop.farmer_id == farmer_id,
        models.Crop.is_available == True,
    ).all()


@router.put("/profile", response_model=schemas.FarmerProfileRead)
def update_farmer_profile(
    payload: schemas.FarmerProfileCreate,
    current_user: models.User = Depends(require_role(models.UserRole.FARMER)),
    db: Session = Depends(get_db),
):
    profile = db.query(models.FarmerProfile).filter(
        models.FarmerProfile.user_id == current_user.id
    ).first()

    if not profile:
        profile = models.FarmerProfile(user_id=current_user.id)
        db.add(profile)

    for field, value in payload.model_dump(exclude_none=True).items():
        setattr(profile, field, value)

    db.commit()
    db.refresh(profile)
    return profile


@router.get("/profile/me", response_model=schemas.FarmerProfileRead)
def get_my_profile(
    current_user: models.User = Depends(require_role(models.UserRole.FARMER)),
    db: Session = Depends(get_db),
):
    profile = db.query(models.FarmerProfile).filter(
        models.FarmerProfile.user_id == current_user.id
    ).first()
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")
    return profile
