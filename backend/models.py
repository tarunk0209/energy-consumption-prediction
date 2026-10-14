
from sqlalchemy import (
    Column,
    Integer,
    String,
    Float,
    Date,
    ForeignKey,
)
from sqlalchemy.orm import relationship

from backend.database import Base


# 1. Products table
class Product(Base):
    __tablename__ = "products"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), unique=True, nullable=False)


# 2. Machine Types table
class MachineType(Base):
    __tablename__ = "machine_types"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), unique=True, nullable=False)


# 3. Shifts table
class Shift(Base):
    __tablename__ = "shifts"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(50), unique=True, nullable=False)


# 4. Production Batches table
class ProductionBatch(Base):
    __tablename__ = "production_batches"

    id = Column(Integer, primary_key=True, index=True)

    product_id = Column(Integer, ForeignKey("products.id"), nullable=False)
    quantity = Column(Integer, nullable=False)
    machine_hours = Column(Float, nullable=False)
    machine_type_id = Column(
        Integer, ForeignKey("machine_types.id"), nullable=False
    )
    shift_id = Column(Integer, ForeignKey("shifts.id"), nullable=False)

    production_date = Column(Date, nullable=False)
    actual_energy_consumed = Column(Float, nullable=True)

    product = relationship("Product")
    machine_type = relationship("MachineType")
    shift = relationship("Shift")


# 5. Energy Predictions table
class EnergyPrediction(Base):
    __tablename__ = "energy_predictions"

    id = Column(Integer, primary_key=True, index=True)

    production_batch_id = Column(
        Integer,
        ForeignKey("production_batches.id"),
        nullable=False,
    )
    estimated_energy = Column(Float, nullable=False)
    unit = Column(String(10), default="kWh", nullable=False)

    production_batch = relationship("ProductionBatch")
