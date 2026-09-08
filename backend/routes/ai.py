"""
KisanConnect – AI Routes
/crop-recommend, /demand-forecast, /route-optimize
"""
import math
from fastapi import APIRouter, HTTPException
from backend import schemas
# AI models are imported lazily (inside each endpoint) to avoid
# OpenBLAS memory errors crashing the worker on startup.

router = APIRouter()


@router.post("/crop-recommend", response_model=schemas.CropRecommendResponse)
def crop_recommend(payload: schemas.CropRecommendRequest):
    """
    Takes soil (N, P, K, pH) and climate (rainfall, temperature, humidity) inputs
    and returns top crop recommendations from the trained ML model.
    """
    try:
        from backend.ai.crop_model import recommend_crops
        result = recommend_crops(
            N=payload.nitrogen,
            P=payload.phosphorus,
            K=payload.potassium,
            ph=payload.ph,
            rainfall=payload.rainfall,
            temperature=payload.temperature,
            humidity=payload.humidity or 70.0,
        )
        return schemas.CropRecommendResponse(
            recommendations=result["recommendations"],
            model_confidence=result["confidence"],
            input_summary={
                "N": payload.nitrogen, "P": payload.phosphorus,
                "K": payload.potassium, "pH": payload.ph,
                "rainfall_mm": payload.rainfall, "temp_c": payload.temperature,
            },
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Model error: {str(e)}")


@router.post("/demand-forecast", response_model=schemas.DemandForecastResponse)
def demand_forecast(payload: schemas.DemandForecastRequest):
    """
    Returns time-series price and demand forecast for the given crop over N days.
    """
    try:
        from backend.ai.demand_model import forecast_demand
        result = forecast_demand(crop_name=payload.crop_name, days=payload.days)
        return schemas.DemandForecastResponse(
            crop_name=payload.crop_name,
            forecast=result["forecast"],
            trend=result["trend"],
            avg_price=result["avg_price"],
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Forecast error: {str(e)}")


@router.post("/route-optimize", response_model=schemas.RouteOptimizeResponse)
def route_optimize(payload: schemas.RouteOptimizeRequest):
    """
    Nearest-neighbor TSP heuristic for logistics route optimization.
    Returns the optimized visit order, total distance, and estimated travel time.
    """
    if not payload.destinations:
        raise HTTPException(status_code=400, detail="At least one destination required")

    def haversine(a: dict, b: dict) -> float:
        """Great-circle distance between two lat/lng points in km."""
        R = 6371.0
        lat1, lon1 = math.radians(a["lat"]), math.radians(a["lng"])
        lat2, lon2 = math.radians(b["lat"]), math.radians(b["lng"])
        dlat = lat2 - lat1
        dlon = lon2 - lon1
        h = math.sin(dlat / 2) ** 2 + math.cos(lat1) * math.cos(lat2) * math.sin(dlon / 2) ** 2
        return 2 * R * math.asin(math.sqrt(h))

    # Nearest-neighbor greedy TSP
    origin = payload.origin
    unvisited = list(payload.destinations)
    route = [origin]
    total_dist = 0.0

    current = origin
    while unvisited:
        nearest = min(unvisited, key=lambda d: haversine(current, d))
        dist = haversine(current, nearest)
        total_dist += dist
        route.append({**nearest, "distance_from_prev_km": round(dist, 2)})
        unvisited.remove(nearest)
        current = nearest

    # Return to origin
    back = haversine(current, origin)
    total_dist += back
    route.append({**origin, "distance_from_prev_km": round(back, 2), "note": "Return to origin"})

    avg_speed_kmh = 40  # Avg Indian rural road speed
    estimated_time = total_dist / avg_speed_kmh

    return schemas.RouteOptimizeResponse(
        optimized_route=route,
        total_distance_km=round(total_dist, 2),
        estimated_time_hours=round(estimated_time, 2),
    )
