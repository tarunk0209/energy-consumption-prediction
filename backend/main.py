
import os
import httpx

from fastapi import FastAPI, Depends, HTTPException, status
from sqlalchemy.orm import Session

from backend.database import Base, engine
from backend.dependencies import get_db
from backend import models, schemas
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(
    title="Energy Consumption Prediction System",
    version="1.0.0",
)
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Create the database tables if they do not exist
Base.metadata.create_all(bind=engine)


@app.get("/")
def home():
    return {"message": "Energy Consumption Prediction API is running"}


# CREATE: Add a product
@app.post("/products", response_model=schemas.ProductResponse,
          status_code=status.HTTP_201_CREATED)
def create_product(product: schemas.ProductCreate,
                   db: Session = Depends(get_db)):
    existing = db.query(models.Product).filter(
        models.Product.name == product.name.strip()
    ).first()

    if existing:
        raise HTTPException(
            status_code=409,
            detail="Product already exists",
        )

    new_product = models.Product(name=product.name.strip())
    db.add(new_product)
    db.commit()
    db.refresh(new_product)
    return new_product


# READ: List all products
@app.get("/products", response_model=list[schemas.ProductResponse])
def get_products(db: Session = Depends(get_db)):
    return db.query(models.Product).order_by(models.Product.id).all()


# UPDATE: Edit a product
@app.put("/products/{product_id}",
         response_model=schemas.ProductResponse)
def update_product(product_id: int,
                   product: schemas.ProductCreate,
                   db: Session = Depends(get_db)):
    existing = db.query(models.Product).filter(
        models.Product.id == product_id
    ).first()

    if existing is None:
        raise HTTPException(status_code=404, detail="Product not found")

    duplicate = db.query(models.Product).filter(
        models.Product.name == product.name.strip(),
        models.Product.id != product_id,
    ).first()

    if duplicate:
        raise HTTPException(status_code=409, detail="Product already exists")

    existing.name = product.name.strip()
    db.commit()
    db.refresh(existing)
    return existing


# DELETE: Remove a product
@app.delete("/products/{product_id}")
def delete_product(product_id: int, db: Session = Depends(get_db)):
    product = db.query(models.Product).filter(
        models.Product.id == product_id
    ).first()

    if product is None:
        raise HTTPException(status_code=404, detail="Product not found")

    # Prevent deletion if production batches reference this product
    used_in_batches = db.query(models.ProductionBatch).filter(
        models.ProductionBatch.product_id == product_id
    ).first()

    if used_in_batches:
        raise HTTPException(
            status_code=409,
            detail="Cannot delete a product used by a production batch",
        )

    db.delete(product)
    db.commit()
    return {"message": "Product deleted successfully"}


# -------------------------------
# MACHINE TYPE CRUD
# -------------------------------

@app.post(
    "/machine-types",
    response_model=schemas.MachineTypeResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_machine_type(
    machine_type: schemas.MachineTypeCreate,
    db: Session = Depends(get_db),
):
    name = machine_type.name.strip()

    existing = db.query(models.MachineType).filter(
        models.MachineType.name == name
    ).first()

    if existing:
        raise HTTPException(status_code=409, detail="Machine type already exists")

    new_machine_type = models.MachineType(name=name)
    db.add(new_machine_type)
    db.commit()
    db.refresh(new_machine_type)
    return new_machine_type


@app.get(
    "/machine-types",
    response_model=list[schemas.MachineTypeResponse],
)
def get_machine_types(db: Session = Depends(get_db)):
    return db.query(models.MachineType).order_by(
        models.MachineType.id
    ).all()


@app.put(
    "/machine-types/{machine_type_id}",
    response_model=schemas.MachineTypeResponse,
)
def update_machine_type(
    machine_type_id: int,
    machine_type: schemas.MachineTypeCreate,
    db: Session = Depends(get_db),
):
    existing = db.query(models.MachineType).filter(
        models.MachineType.id == machine_type_id
    ).first()

    if existing is None:
        raise HTTPException(status_code=404, detail="Machine type not found")

    name = machine_type.name.strip()

    duplicate = db.query(models.MachineType).filter(
        models.MachineType.name == name,
        models.MachineType.id != machine_type_id,
    ).first()

    if duplicate:
        raise HTTPException(status_code=409, detail="Machine type already exists")

    existing.name = name
    db.commit()
    db.refresh(existing)
    return existing


@app.delete("/machine-types/{machine_type_id}")
def delete_machine_type(
    machine_type_id: int,
    db: Session = Depends(get_db),
):
    machine_type = db.query(models.MachineType).filter(
        models.MachineType.id == machine_type_id
    ).first()

    if machine_type is None:
        raise HTTPException(status_code=404, detail="Machine type not found")

    used = db.query(models.ProductionBatch).filter(
        models.ProductionBatch.machine_type_id == machine_type_id
    ).first()

    if used:
        raise HTTPException(
            status_code=409,
            detail="Cannot delete a machine type used by a production batch",
        )

    db.delete(machine_type)
    db.commit()
    return {"message": "Machine type deleted successfully"}


# -------------------------------
# SHIFT CRUD
# -------------------------------

@app.post(
    "/shifts",
    response_model=schemas.ShiftResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_shift(
    shift: schemas.ShiftCreate,
    db: Session = Depends(get_db),
):
    name = shift.name.strip()

    existing = db.query(models.Shift).filter(
        models.Shift.name == name
    ).first()

    if existing:
        raise HTTPException(status_code=409, detail="Shift already exists")

    new_shift = models.Shift(name=name)
    db.add(new_shift)
    db.commit()
    db.refresh(new_shift)
    return new_shift


@app.get("/shifts", response_model=list[schemas.ShiftResponse])
def get_shifts(db: Session = Depends(get_db)):
    return db.query(models.Shift).order_by(models.Shift.id).all()


@app.put("/shifts/{shift_id}", response_model=schemas.ShiftResponse)
def update_shift(
    shift_id: int,
    shift: schemas.ShiftCreate,
    db: Session = Depends(get_db),
):
    existing = db.query(models.Shift).filter(
        models.Shift.id == shift_id
    ).first()

    if existing is None:
        raise HTTPException(status_code=404, detail="Shift not found")

    name = shift.name.strip()

    duplicate = db.query(models.Shift).filter(
        models.Shift.name == name,
        models.Shift.id != shift_id,
    ).first()

    if duplicate:
        raise HTTPException(status_code=409, detail="Shift already exists")

    existing.name = name
    db.commit()
    db.refresh(existing)
    return existing


@app.delete("/shifts/{shift_id}")
def delete_shift(shift_id: int, db: Session = Depends(get_db)):
    shift = db.query(models.Shift).filter(
        models.Shift.id == shift_id
    ).first()

    if shift is None:
        raise HTTPException(status_code=404, detail="Shift not found")

    used = db.query(models.ProductionBatch).filter(
        models.ProductionBatch.shift_id == shift_id
    ).first()

    if used:
        raise HTTPException(
            status_code=409,
            detail="Cannot delete a shift used by a production batch",
        )

    db.delete(shift)
    db.commit()
    return {"message": "Shift deleted successfully"}


# -------------------------------
# PRODUCTION BATCH CRUD
# -------------------------------

@app.post(
    "/production-batches",
    response_model=schemas.ProductionBatchResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_production_batch(
    batch: schemas.ProductionBatchCreate,
    db: Session = Depends(get_db),
):
    # Validate the referenced master records
    if not db.query(models.Product).filter(
        models.Product.id == batch.product_id
    ).first():
        raise HTTPException(status_code=404, detail="Product not found")

    if not db.query(models.MachineType).filter(
        models.MachineType.id == batch.machine_type_id
    ).first():
        raise HTTPException(status_code=404, detail="Machine type not found")

    if not db.query(models.Shift).filter(
        models.Shift.id == batch.shift_id
    ).first():
        raise HTTPException(status_code=404, detail="Shift not found")

    new_batch = models.ProductionBatch(
        product_id=batch.product_id,
        quantity=batch.quantity,
        machine_hours=batch.machine_hours,
        machine_type_id=batch.machine_type_id,
        shift_id=batch.shift_id,
        production_date=batch.production_date,
        actual_energy_consumed=batch.actual_energy_consumed,
    )

    db.add(new_batch)
    db.commit()
    db.refresh(new_batch)
    return new_batch


@app.get(
    "/production-batches",
    response_model=list[schemas.ProductionBatchResponse],
)
def get_production_batches(db: Session = Depends(get_db)):
    return db.query(models.ProductionBatch).order_by(
        models.ProductionBatch.id.desc()
    ).all()


@app.get(
    "/production-batches/{batch_id}",
    response_model=schemas.ProductionBatchResponse,
)
def get_production_batch(batch_id: int, db: Session = Depends(get_db)):
    batch = db.query(models.ProductionBatch).filter(
        models.ProductionBatch.id == batch_id
    ).first()

    if not batch:
        raise HTTPException(status_code=404, detail="Production batch not found")

    return batch


@app.put(
    "/production-batches/{batch_id}",
    response_model=schemas.ProductionBatchResponse,
)
def update_production_batch(
    batch_id: int,
    batch_data: schemas.ProductionBatchCreate,
    db: Session = Depends(get_db),
):
    batch = db.query(models.ProductionBatch).filter(
        models.ProductionBatch.id == batch_id
    ).first()

    if not batch:
        raise HTTPException(status_code=404, detail="Production batch not found")

    # Validate master-data references
    if not db.query(models.Product).filter(
        models.Product.id == batch_data.product_id
    ).first():
        raise HTTPException(status_code=404, detail="Product not found")

    if not db.query(models.MachineType).filter(
        models.MachineType.id == batch_data.machine_type_id
    ).first():
        raise HTTPException(status_code=404, detail="Machine type not found")

    if not db.query(models.Shift).filter(
        models.Shift.id == batch_data.shift_id
    ).first():
        raise HTTPException(status_code=404, detail="Shift not found")

    batch.product_id = batch_data.product_id
    batch.quantity = batch_data.quantity
    batch.machine_hours = batch_data.machine_hours
    batch.machine_type_id = batch_data.machine_type_id
    batch.shift_id = batch_data.shift_id
    batch.production_date = batch_data.production_date
    batch.actual_energy_consumed = batch_data.actual_energy_consumed

    db.commit()
    db.refresh(batch)
    return batch


@app.delete("/production-batches/{batch_id}")
def delete_production_batch(
    batch_id: int,
    db: Session = Depends(get_db),
):
    batch = db.query(models.ProductionBatch).filter(
        models.ProductionBatch.id == batch_id
    ).first()

    if not batch:
        raise HTTPException(status_code=404, detail="Production batch not found")

    # Delete associated prediction history first
    db.query(models.EnergyPrediction).filter(
        models.EnergyPrediction.production_batch_id == batch_id
    ).delete(synchronize_session=False)

    db.delete(batch)
    db.commit()

    return {"message": "Production batch deleted successfully"}


ML_SERVICE_URL = os.getenv(
    "ML_SERVICE_URL",
    "http://127.0.0.1:8001",
)


@app.post(
    "/production-batches/{batch_id}/predict-energy",
    response_model=schemas.EnergyPredictionResponse,
)
def predict_batch_energy(
    batch_id: int,
    db: Session = Depends(get_db),
):
    # 1. Find the production batch
    batch = db.query(models.ProductionBatch).filter(
        models.ProductionBatch.id == batch_id
    ).first()

    if batch is None:
        raise HTTPException(
            status_code=404,
            detail="Production batch not found",
        )

    # 2. Get the related machine type and shift
    machine_type = db.query(models.MachineType).filter(
        models.MachineType.id == batch.machine_type_id
    ).first()

    shift = db.query(models.Shift).filter(
        models.Shift.id == batch.shift_id
    ).first()

    if machine_type is None or shift is None:
        raise HTTPException(
            status_code=400,
            detail="Batch has invalid machine type or shift",
        )

    # 3. Send inputs to the trained ML service
    payload = {
        "quantity": batch.quantity,
        "machineHours": batch.machine_hours,
        "machineType": machine_type.name,
        "shift": shift.name,
    }

    try:
        response = httpx.post(
            f"{ML_SERVICE_URL}/predict-energy",
            json=payload,
            timeout=10.0,
        )
        response.raise_for_status()
        prediction_result = response.json()

    except httpx.TimeoutException:
        raise HTTPException(
            status_code=504,
            detail="ML service timed out",
        )
    except httpx.HTTPError:
        raise HTTPException(
            status_code=502,
            detail="Could not obtain prediction from ML service",
        )

    # 4. Save the prediction in the database
    prediction = models.EnergyPrediction(
        production_batch_id=batch.id,
        estimated_energy=prediction_result["estimatedEnergy"],
        unit=prediction_result["unit"],
    )

    try:
        db.add(prediction)
        db.commit()
        db.refresh(prediction)
        return prediction
    except Exception:
        db.rollback()
        raise HTTPException(
            status_code=500,
            detail="Could not save energy prediction",
        )

@app.get(
    "/energy-predictions",
    response_model=list[schemas.EnergyPredictionResponse],
)
def get_energy_predictions(db: Session = Depends(get_db)):
    return (
        db.query(models.EnergyPrediction)
        .order_by(models.EnergyPrediction.id.desc())
        .all()
    )
