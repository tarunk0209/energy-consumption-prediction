
import csv
import random
from pathlib import Path

random.seed(42)

DATA_DIR = Path(__file__).resolve().parent.parent / "data"
DATA_DIR.mkdir(parents=True, exist_ok=True)

OUTPUT_FILE = DATA_DIR / "historical_production.csv"

machine_types = ["CNC", "Injection Molding", "Assembly"]
shifts = ["Morning", "Evening", "Night"]

rows = []

for _ in range(500):
    quantity = random.randint(20, 500)
    machine_hours = round(random.uniform(1, 12), 2)
    machine_type = random.choice(machine_types)
    shift = random.choice(shifts)

    # Illustrative simulation assumptions, not real factory measurements.
    machine_base = {
        "CNC": 12,
        "Injection Molding": 18,
        "Assembly": 7,
    }[machine_type]

    shift_factor = {
        "Morning": 1.00,
        "Evening": 1.04,
        "Night": 1.02,
    }[shift]

    energy = (
        quantity * 1.5
        + machine_hours * machine_base
    ) * shift_factor

    # Simulate small measurement variation.
    energy += random.uniform(-8, 8)
    energy = round(max(1, energy), 2)

    rows.append({
        "quantity": quantity,
        "machine_hours": machine_hours,
        "machine_type": machine_type,
        "shift": shift,
        "actual_energy_consumed": energy,
    })

with OUTPUT_FILE.open("w", newline="", encoding="utf-8") as file:
    writer = csv.DictWriter(file, fieldnames=[
        "quantity",
        "machine_hours",
        "machine_type",
        "shift",
        "actual_energy_consumed",
    ])
    writer.writeheader()
    writer.writerows(rows)

print(f"Generated {len(rows)} synthetic records.")
print(f"Dataset saved to: {OUTPUT_FILE}")
