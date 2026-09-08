"""
KisanConnect – Demand & Price Forecasting Model
Time-series forecasting using linear trend + seasonal moving average.
No external data needed – uses synthetic base prices per crop.
"""
import math
import random
from datetime import datetime, timedelta
from typing import List, Dict

# Base market prices (₹/kg) for common Indian crops
BASE_PRICES: Dict[str, float] = {
    "Rice":         28.0,
    "Maize":        20.0,
    "Wheat":        24.0,
    "Chickpea":     65.0,
    "Kidney Beans": 90.0,
    "Lentil":       70.0,
    "Mung Bean":    80.0,
    "Black Gram":   85.0,
    "Potato":       18.0,
    "Tomato":       25.0,
    "Onion":        22.0,
    "Banana":       35.0,
    "Mango":        60.0,
    "Cotton":       55.0,
    "Sugarcane":    3.5,
    "Turmeric":     90.0,
    "Coconut":      18.0,
    "Coffee":       300.0,
    "Jute":         45.0,
    "Soybean":      40.0,
    "Groundnut":    55.0,
    "Mustard":      50.0,
    "Pomegranate":  80.0,
    "Papaya":       20.0,
    "Grapes":       70.0,
    "Orange":       45.0,
    "Watermelon":   12.0,
    "Pigeon Peas":  100.0,
}

DEFAULT_PRICE = 30.0


def _get_trend_factor(crop_name: str) -> float:
    """
    Assign a deterministic (seed-based) annual price trend factor.
    Returns a small positive/negative drift per day.
    """
    rng = random.Random(hash(crop_name.lower()) % (2**31))
    return rng.uniform(-0.002, 0.006)  # -0.2% to +0.6% per day


def _seasonal_multiplier(day_of_year: int, crop_name: str) -> float:
    """
    Apply a sine-wave seasonal pattern so prices peak and trough realistically.
    Phase is crop-specific.
    """
    phase = (hash(crop_name) % 365)
    amplitude = 0.10  # ±10% seasonal swing
    return 1 + amplitude * math.sin(2 * math.pi * (day_of_year + phase) / 365)


def _demand_level(price: float, base_price: float) -> str:
    ratio = price / base_price
    if ratio > 1.2:
        return "Low"
    elif ratio > 0.9:
        return "Medium"
    else:
        return "High"


def forecast_demand(crop_name: str, days: int = 30) -> dict:
    """
    Generate a price and demand forecast for `crop_name` over `days` days.
    Uses linear trend + seasonal sine wave + small Gaussian noise.
    """
    # Normalize crop name
    matched_name = next(
        (k for k in BASE_PRICES if k.lower() == crop_name.lower()), None
    )
    base_price = BASE_PRICES.get(matched_name, DEFAULT_PRICE)
    trend = _get_trend_factor(crop_name)

    rng = random.Random(hash(crop_name + str(datetime.utcnow().date())) % (2**31))
    today = datetime.utcnow().date()

    forecast = []
    prices = []

    for i in range(days):
        date = today + timedelta(days=i)
        doy = date.timetuple().tm_yday
        seasonal = _seasonal_multiplier(doy, crop_name)
        noise = rng.gauss(0, base_price * 0.03)  # 3% noise

        price = max(1.0, base_price * (1 + trend * i) * seasonal + noise)
        price = round(price, 2)
        prices.append(price)

        demand = _demand_level(price, base_price)
        # Estimated demand in tonnes (inversely correlated with price)
        demand_tonnes = round(max(0.5, 50 - (price / base_price) * 20 + rng.gauss(0, 5)), 1)

        forecast.append({
            "date": date.isoformat(),
            "price_per_kg": price,
            "demand": demand,
            "estimated_demand_tonnes": demand_tonnes,
            "change_pct": round(((price - base_price) / base_price) * 100, 2),
        })

    avg_price = round(sum(prices) / len(prices), 2)

    # Overall trend determination
    if prices[-1] > prices[0] * 1.05:
        trend_label = "Bullish 📈"
    elif prices[-1] < prices[0] * 0.95:
        trend_label = "Bearish 📉"
    else:
        trend_label = "Stable ↔"

    return {
        "forecast": forecast,
        "trend": trend_label,
        "avg_price": avg_price,
        "base_price": base_price,
    }
