from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import joblib
import json
import numpy as np
import pandas as pd
from sqlalchemy.orm import Session
from database import get_db, Prediction

# Load model and feature names
model = joblib.load("diabetes_model.pkl")
with open("feature_names.json", "r") as f:
    feature_names = json.load(f)

app = FastAPI(title="MediScan AI", version="1.0")

# Allow React frontend to talk to this backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# This defines what data the API expects to receive
class PatientData(BaseModel):
    Pregnancies: float
    Glucose: float
    BloodPressure: float
    SkinThickness: float
    Insulin: float
    BMI: float
    DiabetesPedigreeFunction: float
    Age: float

@app.get("/")
def root():
    return {"message": "MediScan AI backend is running"}

@app.post("/predict")
def predict(data: PatientData, db: Session = Depends(get_db)):
    # Arrange input in correct column order
    input_data = pd.DataFrame(
        [[getattr(data, col) for col in feature_names]],
        columns=feature_names
    )

    # Get prediction and probability
    prediction = model.predict(input_data)[0]
    probability = model.predict_proba(input_data)[0][1]
    risk_level = "High Risk" if prediction == 1 else "Low Risk"

    # Save to database
    record = Prediction(
        pregnancies=data.Pregnancies,
        glucose=data.Glucose,
        blood_pressure=data.BloodPressure,
        skin_thickness=data.SkinThickness,
        insulin=data.Insulin,
        bmi=data.BMI,
        diabetes_pedigree=data.DiabetesPedigreeFunction,
        age=data.Age,
        prediction=int(prediction),
        probability=round(float(probability) * 100, 2),
        risk_level=risk_level
    )
    db.add(record)
    db.commit()
    db.refresh(record)

    return {
        "id": record.id,
        "prediction": int(prediction),
        "probability": round(float(probability) * 100, 2),
        "risk_level": risk_level
    }

@app.get("/history")
def get_history(db: Session = Depends(get_db)):
    records = db.query(Prediction).order_by(Prediction.created_at.desc()).limit(20).all()
    return [
        {
            "id": r.id,
            "glucose": r.glucose,
            "bmi": r.bmi,
            "age": r.age,
            "prediction": r.prediction,
            "probability": r.probability,
            "risk_level": r.risk_level,
            "created_at": r.created_at
        }
        for r in records
    ]