
from datetime import date
from pydantic import BaseModel, Field, ConfigDict


# Product schemas
class ProductCreate(BaseModel):
    name: str = Field(min_length=1, max_length=100)


class ProductResponse(BaseModel):
    id: int
    name: str

    model_config = ConfigDict(from_attributes=True)


# Machine Type schemas
class MachineTypeCreate(BaseModel):
    name: str = Field(min_length=1, max_length=100)


class MachineTypeResponse(BaseModel):
    id: int
    name: str

    model_config = ConfigDict(from_attributes=True)


# Shift schemas
class ShiftCreate(BaseModel):
    name: str = Field(min_length=1, max_length=50)


class ShiftResponse(BaseModel):
    id: int
    name: str

    model_config = ConfigDict(from_attributes=True)


# Production Batch schemas
class ProductionBatchCreate(BaseModel):
    product_id: int = Field(gt=0)
    quantity: int = Field(gt=0)
    machine_hours: float = Field(gt=0)
    machine_type_id: int = Field(gt=0)
    shift_id: int = Field(gt=0)
    production_date: date
    actual_energy_consumed: float | None = Field(default=None, gt=0)


class ProductionBatchResponse(BaseModel):
    id: int
    product_id: int
    quantity: int
    machine_hours: float
    machine_type_id: int
    shift_id: int
    production_date: date
    actual_energy_consumed: float | None

    model_config = ConfigDict(from_attributes=True)


# Energy Prediction schemas
class EnergyPredictionResponse(BaseModel):
    id: int
    production_batch_id: int
    estimated_energy: float
    unit: str

    model_config = ConfigDict(from_attributes=True)


class EnergyPredictionRequest(BaseModel):
    production_batch_id: int = Field(gt=0)
