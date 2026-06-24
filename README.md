# MediScan AI 🩺

A full-stack AI-powered web application that predicts diabetes risk based on patient health parameters using a trained Machine Learning model.

## Features
- Predicts diabetes risk with probability score using a trained Random Forest model
- Clean, responsive UI built with React and Tailwind CSS
- FastAPI backend with REST API endpoints
- SQLite database stores every prediction with timestamp
- Prediction history page to view past results

## Tech Stack

| Layer | Technology |
|---|---|
| ML Model | scikit-learn (Random Forest), XGBoost |
| Backend | FastAPI, Python, SQLAlchemy |
| Database | SQLite |
| Frontend | React, Vite, Tailwind CSS, Axios |

## ML Model Details
- Dataset: PIMA Indians Diabetes Database (768 samples, 8 features)
- Preprocessing: Replaced biologically invalid zero values in Glucose, BloodPressure, SkinThickness, Insulin, and BMI with median imputation
- Model: Random Forest Classifier (100 estimators)
- Accuracy: 75% on test set

## How to Run Locally

Backend:
cd backend
pip install fastapi uvicorn sqlalchemy pandas scikit-learn joblib
uvicorn main:app --reload

Frontend:
cd frontend
npm install
npm run dev

## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| GET | / | Health check |
| POST | /predict | Get diabetes prediction |
| GET | /history | Fetch last 20 predictions |

## Author
Rahul Raj - B.Tech Computer Science, KIIT University