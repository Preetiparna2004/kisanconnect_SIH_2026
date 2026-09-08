# KisanConnect 🌾
**Direct Farm-to-Table Marketplace with AI Insights (SIH 2026)**

KisanConnect is a full-stack digital platform designed to eliminate intermediaries by connecting farmers and FPOs directly with consumers and bulk buyers.

## Features
- **Zero Intermediaries**: Direct marketplace for farmers and buyers.
- **AI Crop Advisor**: Machine learning (RandomForest) for soil and climate-based crop recommendations.
- **Demand Forecasting**: Time-series analytics for price and demand predictions.
- **Route Optimization**: Nearest-neighbor TSP heuristic for efficient delivery routes.
- **Multilingual Support**: English, Hindi, and Odia.
- **Role-based Dashboards**: Custom interfaces for Farmers, Buyers, and Admins.

## Tech Stack
- **Frontend**: React, Vite, Tailwind CSS, React Router, i18next, Recharts.
- **Backend**: Python, FastAPI, SQLAlchemy, SQLite, JWT Auth.
- **ML/AI**: Scikit-learn (RandomForest, Time-series).

## Getting Started

### 1. Backend Setup
```bash
cd backend
python -m venv venv
# Windows: venv\Scripts\activate
# Mac/Linux: source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env  # Optional
uvicorn backend.main:app --reload
```
API runs on `http://localhost:8000`. Swagger docs at `http://localhost:8000/docs`.

### 2. Frontend Setup
Open a new terminal.
```bash
cd frontend
npm install
npm run dev
```
App runs on `http://localhost:5173`.

## Demo Credentials
You can use the built-in "Demo" buttons on the Login page, or use:
- **Farmer**: ramesh@kisanconnect.in / farmer123
- **Buyer**: buyer@kisanconnect.in / buyer123
- **Admin**: admin@kisanconnect.in / admin123
