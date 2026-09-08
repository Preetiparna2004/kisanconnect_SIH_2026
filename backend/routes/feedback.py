"""
KisanConnect – Feedback Routes
Rating & comment submission, fetch by farmer/crop
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from backend.database import get_db
from backend import models, schemas
from backend.routes.auth import get_current_user

router = APIRouter()


@router.post("/", response_model=schemas.FeedbackRead, status_code=201)
def submit_feedback(
    payload: schemas.FeedbackCreate,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    # Validate farmer exists
    farmer = db.query(models.User).filter(
        models.User.id == payload.farmer_id,
        models.User.role == models.UserRole.FARMER,
    ).first()
    if not farmer:
        raise HTTPException(status_code=404, detail="Farmer not found")

    fb = models.Feedback(
        reviewer_id=current_user.id,
        farmer_id=payload.farmer_id,
        crop_id=payload.crop_id,
        rating=payload.rating,
        comment=payload.comment,
    )
    db.add(fb)

    # Update farmer profile rating
    profile = db.query(models.FarmerProfile).filter(
        models.FarmerProfile.user_id == payload.farmer_id
    ).first()
    if profile:
        total = profile.total_reviews
        old_rating = profile.rating
        profile.total_reviews += 1
        profile.rating = round((old_rating * total + payload.rating) / profile.total_reviews, 2)

    db.commit()
    db.refresh(fb)
    return fb


@router.get("/farmer/{farmer_id}", response_model=List[schemas.FeedbackRead])
def get_farmer_feedback(farmer_id: int, db: Session = Depends(get_db)):
    return db.query(models.Feedback).filter(
        models.Feedback.farmer_id == farmer_id
    ).order_by(models.Feedback.created_at.desc()).all()


@router.get("/crop/{crop_id}", response_model=List[schemas.FeedbackRead])
def get_crop_feedback(crop_id: int, db: Session = Depends(get_db)):
    return db.query(models.Feedback).filter(
        models.Feedback.crop_id == crop_id
    ).order_by(models.Feedback.created_at.desc()).all()
