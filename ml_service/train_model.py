
from pathlib import Path

import joblib
import pandas as pd

from sklearn.compose import ColumnTransformer
from sklearn.linear_model import LinearRegression
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
from sklearn.model_selection import train_test_split
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import OneHotEncoder

BASE_DIR = Path(__file__).resolve().parent.parent
DATA_FILE = BASE_DIR / "data" / "historical_production.csv"
MODEL_DIR = BASE_DIR / "models"
MODEL_FILE = MODEL_DIR / "energy_model.joblib"

# 1. Load the historical dataset
df = pd.read_csv(DATA_FILE)

# 2. Define the four required input features and target
features = [
    "quantity",
    "machine_hours",
    "machine_type",
    "shift",
]
target = "actual_energy_consumed"

X = df[features]
y = df[target]

# 3. Separate numerical and categorical features
numeric_features = ["quantity", "machine_hours"]
categorical_features = ["machine_type", "shift"]

# 4. Encode text categories as numerical features
preprocessor = ColumnTransformer(
    transformers=[
        ("numeric", "passthrough", numeric_features),
        (
            "categorical",
            OneHotEncoder(handle_unknown="ignore"),
            categorical_features,
        ),
    ]
)

# 5. Build the regression pipeline
model = Pipeline(
    steps=[
        ("preprocessor", preprocessor),
        ("regressor", LinearRegression()),
    ]
)

# 6. Split records into training and testing sets
X_train, X_test, y_train, y_test = train_test_split(
    X,
    y,
    test_size=0.2,
    random_state=42,
)

# 7. Train only on the training set
model.fit(X_train, y_train)

# 8. Evaluate on unseen test records
predictions = model.predict(X_test)

mae = mean_absolute_error(y_test, predictions)
rmse = mean_squared_error(y_test, predictions) ** 0.5
r2 = r2_score(y_test, predictions)

print(f"Training records: {len(X_train)}")
print(f"Testing records: {len(X_test)}")
print(f"MAE: {mae:.2f} kWh")
print(f"RMSE: {rmse:.2f} kWh")
print(f"R²: {r2:.4f}")

# 9. Save the trained pipeline
MODEL_DIR.mkdir(parents=True, exist_ok=True)
joblib.dump(model, MODEL_FILE)

print(f"Model saved to: {MODEL_FILE}")
