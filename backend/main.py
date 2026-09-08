"""
KisanConnect – FastAPI Application Entry Point
"""
import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from contextlib import asynccontextmanager

from backend.config import settings
from backend.database import create_tables
from backend.routes import auth, farmers, crops, orders, payments, messages, feedback, ai, admin


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan: create tables on startup."""
    create_tables()
    # Create upload directory
    os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
    yield


app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="KisanConnect API – Connecting Farmers Directly to Buyers (SIH 2026)",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan,
)

# ──────────────────────── CORS ────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ──────────────────────── Static Files ────────────────────────
os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=settings.UPLOAD_DIR), name="uploads")

# ──────────────────────── Routers ────────────────────────
app.include_router(auth.router,     prefix="/api/auth",     tags=["Authentication"])
app.include_router(farmers.router,  prefix="/api/farmers",  tags=["Farmers"])
app.include_router(crops.router,    prefix="/api/crops",    tags=["Crops"])
app.include_router(orders.router,   prefix="/api/orders",   tags=["Orders"])
app.include_router(payments.router, prefix="/api/payments", tags=["Payments"])
app.include_router(messages.router, prefix="/api/messages", tags=["Messages"])
app.include_router(feedback.router, prefix="/api/feedback", tags=["Feedback"])
app.include_router(ai.router,       prefix="/api/ai",       tags=["AI & Analytics"])
app.include_router(admin.router,    prefix="/api/admin",    tags=["Admin"])


@app.get("/", tags=["Health"])
def root():
    return {
        "app": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "status": "running",
        "docs": "/docs",
    }


@app.get("/health", tags=["Health"])
def health():
    return {"status": "healthy"}


@app.get("/api/health", tags=["Health"])
def api_health():
    return {"status": "healthy"}
