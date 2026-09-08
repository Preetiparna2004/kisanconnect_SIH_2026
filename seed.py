"""
KisanConnect – Database Seed Script
Run this ONCE to:
  1. Drop and recreate all tables (fresh schema with approval_status column)
  2. Create 3 demo accounts: farmer, buyer, admin

Usage:
    cd d:\Projects\SIH2026\kisanconnect
    python seed.py
"""
import sys, os
sys.path.insert(0, os.path.dirname(__file__))

from datetime import datetime, timedelta
from backend.database import engine, Base, SessionLocal
from backend import models
from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def seed():
    print("[*] Dropping all tables...")
    Base.metadata.drop_all(bind=engine)

    print("[*] Creating all tables (fresh schema)...")
    Base.metadata.create_all(bind=engine)

    db = SessionLocal()
    try:
        demo_users = [
            {
                "full_name":  "Ramesh Demo Farmer",
                "email":      "farmerdemo@kisanconnect.in",
                "password":   "farmaer123",
                "role":       models.UserRole.FARMER,
                "state":      "Odisha",
                "district":   "Cuttack",
                "village":    "Balikuda",
            },
            {
                "full_name":  "Sunita Demo Consumer",
                "email":      "buyerdemo@kisanconnect.in",
                "password":   "buyer123",
                "role":       models.UserRole.CONSUMER,
                "state":      "Delhi",
                "district":   "New Delhi",
            },
            {
                "full_name":  "Admin KisanConnect",
                "email":      "admin@kisanconnect.in",
                "password":   "admin123",
                "role":       models.UserRole.ADMIN,
                "state":      "Delhi",
                "district":   "New Delhi",
            },
            {
                "full_name":  "Odisha Farmers FPO",
                "email":      "fpodemo@kisanconnect.in",
                "password":   "fpo123",
                "role":       models.UserRole.FPO,
                "state":      "Odisha",
                "district":   "Khurda",
                "village":    "Bhubaneswar",
            },
            {
                "full_name":  "MegaMart Wholesale",
                "email":      "bulkdemo@kisanconnect.in",
                "password":   "bulk123",
                "role":       models.UserRole.BULK_BUYER,
                "state":      "Maharashtra",
                "district":   "Mumbai",
            },
        ]

        for u in demo_users:
            password = u.pop("password")
            user = models.User(
                **u,
                hashed_password=pwd_context.hash(password),
                is_active=True,
                is_verified=True,
            )
            db.add(user)
            db.flush()

            # Auto-create farmer profile
            if user.role in [models.UserRole.FARMER, models.UserRole.FPO]:
                profile = models.FarmerProfile(
                    user_id=user.id,
                    bio="Demo producer from Odisha." if user.role == models.UserRole.FARMER else "A collective of 500+ organic farmers.",
                    land_area_acres=12.5 if user.role == models.UserRole.FARMER else 2500.0,
                    soil_type="Alluvial",
                    irrigation_type="Canal",
                    is_fpo=(user.role == models.UserRole.FPO),
                    fpo_name=user.full_name if user.role == models.UserRole.FPO else None,
                )
                db.add(profile)

            print(f"  [OK] Created {user.role.value}: {user.email}")
            
        # Seed Crops for the Demo Farmer
        demo_farmer = db.query(models.User).filter_by(email="farmerdemo@kisanconnect.in").first()
        if demo_farmer:
            demo_crops = [
                models.Crop(
                    farmer_id=demo_farmer.id,
                    name="Organic Basmati Rice",
                    category=models.CropCategory.CEREALS,
                    description="Premium quality, organically grown basmati rice. Long grain and highly aromatic.",
                    price_per_kg=120.0,
                    bulk_price_per_kg=100.0,
                    quantity_kg=500.0,
                    minimum_order_qty=50.0,
                    location="Cuttack, Odisha",
                    image_url="https://upload.wikimedia.org/wikipedia/commons/thumb/d/d2/Basmati_Rice.jpg/500px-Basmati_Rice.jpg",
                    is_organic=True,
                    is_available=True,
                    approval_status=models.CropApprovalStatus.APPROVED,
                ),
                models.Crop(
                    farmer_id=demo_farmer.id,
                    name="Red Onions",
                    category=models.CropCategory.VEGETABLES,
                    description="Freshly harvested medium-sized red onions. Good shelf life.",
                    price_per_kg=40.0,
                    bulk_price_per_kg=32.0,
                    quantity_kg=1200.0,
                    minimum_order_qty=100.0,
                    location="Cuttack, Odisha",
                    image_url="https://upload.wikimedia.org/wikipedia/commons/thumb/3/30/Red_Onion_Sliced.jpg/500px-Red_Onion_Sliced.jpg",
                    is_organic=False,
                    is_available=True,
                    approval_status=models.CropApprovalStatus.APPROVED,
                ),
                models.Crop(
                    farmer_id=demo_farmer.id,
                    name="Alphonso Mango",
                    category=models.CropCategory.FRUITS,
                    description="Sweet and juicy Alphonso mangoes.",
                    price_per_kg=250.0,
                    quantity_kg=200.0,
                    location="Cuttack, Odisha",
                    image_url="https://upload.wikimedia.org/wikipedia/commons/thumb/5/52/Alphonso_mango.jpg/500px-Alphonso_mango.jpg",
                    is_organic=True,
                    is_available=True,
                    approval_status=models.CropApprovalStatus.APPROVED,
                )
            ]
            for crop in demo_crops:
                db.add(crop)
            print("  [OK] Seeded 3 crops for the demo farmer.")

        db.commit()
        print("\n[DONE] Seed complete! You can now log in with:")
        print("   Farmer      -> farmerdemo@kisanconnect.in / farmaer123")
        print("   FPO         -> fpodemo@kisanconnect.in    / fpo123")
        print("   Consumer    -> buyerdemo@kisanconnect.in  / buyer123")
        print("   Bulk Buyer  -> bulkdemo@kisanconnect.in   / bulk123")
        print("   Admin       -> admin@kisanconnect.in      / admin123")

    except Exception as e:
        db.rollback()
        print(f"\n[ERROR] Seed failed: {e}")
        raise
    finally:
        db.close()


if __name__ == "__main__":
    seed()
