
from pathlib import Path

import joblib
import pandas as pd
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, ConfigDict, Field

BASE_DIR = Path(__file__).resolve().parent.parent
MODEL_FILE = BASE_DIR / "models" / "energy_model.joblib"

# Load the trained model once when the service starts.
if not MODEL_FILE.exists():
    raise RuntimeError(
        "Trained model not found. Run python -m ml_service.train_model first."
    )

model = joblib.load(MODEL_FILE)

app = FastAPI(
    title="Energy Prediction ML Service",
    description="Predicts energy consumption using a trained regression model",
    version="1.0.0",
)


class PredictionRequest(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    quantity: int = Field(gt=0)
    machine_hours: float = Field(alias="machineHours", gt=0)
    machine_type: str = Field(alias="machineType", min_length=1)
    shift: str = Field(min_length=1)


class PredictionResponse(BaseModel):
    estimated_energy: float = Field(alias="estimatedEnergy")
    unit: str = "kWh"

    model_config = ConfigDict(populate_by_name=True)


@app.get("/")
def home():
    return {"message": "Energy Prediction ML Service is running"}


@app.post("/predict-energy", response_model=PredictionResponse)
def predict_energy(request: PredictionRequest):
    machine_type = request.machine_type.strip()
    shift = request.shift.strip()

    # Check categories supported by the training dataset.
    preprocessor = model.named_steps["preprocessor"]
    encoder = preprocessor.named_transformers_["categorical"]

    known_machine_types = set(encoder.categories_[0])
    known_shifts = set(encoder.categories_[1])

    if machine_type not in known_machine_types:
        raise HTTPException(
            status_code=422,
            detail=f"Unknown machine type: {machine_type}",
        )

    if shift not in known_shifts:
        raise HTTPException(
            status_code=422,
            detail=f"Unknown shift: {shift}",
        )

    input_data = pd.DataFrame([{
        "quantity": request.quantity,
        "machine_hours": request.machine_hours,
        "machine_type": machine_type,
        "shift": shift,
    }])

    try:
        estimated_energy = float(model.predict(input_data)[0])
    except Exception as exc:
        raise HTTPException(
            status_code=500,
            detail="Energy prediction failed",
        ) from exc

    # Energy consumption cannot be negative.
    estimated_energy = max(0.0, estimated_energy)

    return PredictionResponse(
        estimated_energy=round(estimated_energy, 2),
        unit="kWh",
    )
