"""
KisanConnect – Messages Routes
Inbox, outbox, send, mark as read
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from backend.database import get_db
from backend import models, schemas
from backend.routes.auth import get_current_user

router = APIRouter()


@router.post("/", response_model=schemas.MessageRead, status_code=201)
def send_message(
    payload: schemas.MessageCreate,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    receiver = db.query(models.User).filter(models.User.id == payload.receiver_id).first()
    if not receiver:
        raise HTTPException(status_code=404, detail="Receiver not found")

    msg = models.Message(
        sender_id=current_user.id,
        receiver_id=payload.receiver_id,
        content=payload.content,
    )
    db.add(msg)
    db.commit()
    db.refresh(msg)
    return msg


@router.get("/inbox", response_model=List[schemas.MessageRead])
def inbox(
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return db.query(models.Message).filter(
        models.Message.receiver_id == current_user.id
    ).order_by(models.Message.created_at.desc()).all()


@router.get("/outbox", response_model=List[schemas.MessageRead])
def outbox(
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return db.query(models.Message).filter(
        models.Message.sender_id == current_user.id
    ).order_by(models.Message.created_at.desc()).all()


@router.get("/conversation/{other_user_id}", response_model=List[schemas.MessageRead])
def conversation(
    other_user_id: int,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    msgs = db.query(models.Message).filter(
        ((models.Message.sender_id == current_user.id) & (models.Message.receiver_id == other_user_id)) |
        ((models.Message.sender_id == other_user_id) & (models.Message.receiver_id == current_user.id))
    ).order_by(models.Message.created_at.asc()).all()

    # Mark received messages as read
    for m in msgs:
        if m.receiver_id == current_user.id and not m.is_read:
            m.is_read = True
    db.commit()
    return msgs


@router.put("/{message_id}/read", response_model=schemas.MessageResponse)
def mark_read(
    message_id: int,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    msg = db.query(models.Message).filter(
        models.Message.id == message_id,
        models.Message.receiver_id == current_user.id,
    ).first()
    if not msg:
        raise HTTPException(status_code=404, detail="Message not found")
    msg.is_read = True
    db.commit()
    return {"message": "Marked as read"}
