"""
KisanConnect – Crop Recommendation Model
Scikit-learn RandomForest trained on synthetic Indian crop dataset.
Inputs: N, P, K, pH, rainfall, temperature, humidity
Output: Top-3 crop recommendations with confidence scores
"""
import os
import numpy as np
import joblib
from pathlib import Path
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import StandardScaler
from sklearn.pipeline import Pipeline

# ── Constants ──────────────────────────────────────────────────────────────────
MODEL_DIR = Path(__file__).parent / "saved_models"
MODEL_PATH = MODEL_DIR / "crop_model.joblib"

CROP_LABELS = [
    "Rice", "Maize", "Chickpea", "Kidney Beans", "Pigeon Peas",
    "Moth Beans", "Mung Bean", "Black Gram", "Lentil", "Pomegranate",
    "Banana", "Mango", "Grapes", "Watermelon", "Muskmelon",
    "Apple", "Orange", "Papaya", "Coconut", "Cotton",
    "Jute", "Coffee", "Wheat", "Sugarcane", "Turmeric",
]

# Realistic soil/climate profiles for each crop (N, P, K, pH, rainfall, temp, humidity)
CROP_PROFILES = {
    "Rice":        [80, 40, 40, 6.5, 200, 25, 82],
    "Maize":       [85, 58, 41, 6.5, 65,  22, 65],
    "Chickpea":    [40, 67, 79, 7.5, 40,  18, 16],
    "Kidney Beans":[20, 67, 20, 5.7, 100, 20, 21],
    "Pigeon Peas": [20, 67, 20, 5.7, 100, 28, 48],
    "Moth Beans":  [20, 40, 20, 7.0, 48,  28, 53],
    "Mung Bean":   [20, 47, 20, 6.7, 40,  28, 85],
    "Black Gram":  [40, 67, 19, 7.1, 68,  30, 65],
    "Lentil":      [18, 68, 19, 6.9, 45,  24, 64],
    "Pomegranate": [18, 18, 40, 6.9, 100, 22, 90],
    "Banana":      [100,75, 50, 6.0, 100, 27, 80],
    "Mango":       [20, 20, 30, 5.7, 100, 31, 50],
    "Grapes":      [23, 132,200, 6.0, 68,  24, 81],
    "Watermelon":  [99, 17, 50, 5.9, 50,  25, 85],
    "Muskmelon":   [100,17, 50, 6.5, 24,  28, 92],
    "Apple":       [21, 134,199, 5.8, 114, 22, 92],
    "Orange":      [20, 10, 10, 7.0, 110, 23, 92],
    "Papaya":      [50, 59, 50, 6.5, 140, 34, 92],
    "Coconut":     [22, 16, 30, 5.9, 170, 27, 94],
    "Cotton":      [117,46, 19, 6.8, 80,  24, 63],
    "Jute":        [78, 46, 39, 6.7, 170, 25, 80],
    "Coffee":      [101,28, 29, 6.8, 200, 25, 90],
    "Wheat":       [103,40, 39, 6.5, 65,  22, 65],
    "Sugarcane":   [20, 40, 40, 6.5, 95,  27, 65],
    "Turmeric":    [60, 40, 40, 6.0, 180, 28, 80],
}


def _generate_training_data(n_samples: int = 5000):
    """Generate synthetic training data with realistic variance around crop profiles."""
    rng = np.random.RandomState(42)
    X, y = [], []

    crops = list(CROP_PROFILES.keys())
    samples_per_crop = n_samples // len(crops)

    for label_idx, crop in enumerate(crops):
        base = np.array(CROP_PROFILES[crop], dtype=float)
        # Add Gaussian noise relative to base values
        noise_scale = base * 0.15
        noise_scale = np.clip(noise_scale, 1.0, None)
        samples = rng.normal(loc=base, scale=noise_scale, size=(samples_per_crop, len(base)))
        # Clip to valid ranges: N,P,K ∈ [0,200], pH ∈ [3,10], rainfall ≥ 0, temp ∈ [5,45], hum ∈ [10,100]
        samples[:, 0:3] = np.clip(samples[:, 0:3], 0, 200)
        samples[:, 3]   = np.clip(samples[:, 3], 3.5, 10.0)
        samples[:, 4]   = np.clip(samples[:, 4], 0, 400)
        samples[:, 5]   = np.clip(samples[:, 5], 5, 45)
        samples[:, 6]   = np.clip(samples[:, 6], 10, 100)
        X.append(samples)
        y.extend([label_idx] * samples_per_crop)

    return np.vstack(X), np.array(y), crops


def _train_and_save_model():
    """Train the RandomForest pipeline and persist it."""
    MODEL_DIR.mkdir(parents=True, exist_ok=True)
    X, y, crops = _generate_training_data()

    pipeline = Pipeline([
        ("scaler", StandardScaler()),
        ("clf", RandomForestClassifier(
            n_estimators=200,
            max_depth=15,
            random_state=42,
            n_jobs=-1,
        )),
    ])
    pipeline.fit(X, y)
    joblib.dump({"pipeline": pipeline, "crops": crops}, MODEL_PATH)
    print(f"[CropModel] Trained & saved to {MODEL_PATH}")
    return pipeline, crops


def _load_model():
    if not MODEL_PATH.exists():
        print("[CropModel] No saved model found – training now...")
        return _train_and_save_model()
    data = joblib.load(MODEL_PATH)
    return data["pipeline"], data["crops"]


# Load (or train) model at import time
_pipeline, _crops = _load_model()


def recommend_crops(
    N: float, P: float, K: float, ph: float,
    rainfall: float, temperature: float, humidity: float,
    top_k: int = 5,
) -> dict:
    """
    Returns top-k crop recommendations with probability scores.
    """
    features = np.array([[N, P, K, ph, rainfall, temperature, humidity]])
    probs = _pipeline.predict_proba(features)[0]

    top_indices = np.argsort(probs)[::-1][:top_k]
    recommendations = []

    for idx in top_indices:
        crop_name = _crops[idx]
        profile = CROP_PROFILES.get(crop_name, [])
        recommendations.append({
            "rank": len(recommendations) + 1,
            "crop": crop_name,
            "confidence": round(float(probs[idx]) * 100, 1),
            "ideal_conditions": {
                "N": profile[0], "P": profile[1], "K": profile[2],
                "pH": profile[3], "rainfall_mm": profile[4],
                "temp_c": profile[5], "humidity_pct": profile[6],
            } if profile else {},
        })

    return {
        "recommendations": recommendations,
        "confidence": round(float(probs[top_indices[0]]) * 100, 1),
    }
