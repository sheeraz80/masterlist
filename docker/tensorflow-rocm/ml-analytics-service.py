"""
ML Analytics Service with ROCm-accelerated TensorFlow
Runs in Docker container with full GPU support
"""

import tensorflow as tf
import numpy as np
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List, Dict, Optional
import logging

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Check GPU availability
logger.info(f"TensorFlow version: {tf.__version__}")
logger.info(f"GPU Available: {tf.config.list_physical_devices('GPU')}")

app = FastAPI(title="ML Analytics Service", version="1.0.0")

# Data models
class ProjectFeatures(BaseModel):
    quality_score: float
    technical_complexity: float
    revenue_potential: float
    category_popularity: float
    competition_level: float
    team_size: float
    activities_count: float

class PredictionResult(BaseModel):
    success_probability: float
    risk_level: str
    confidence_score: float
    factors: Dict[str, List[str]]
    gpu_accelerated: bool

class TrainingData(BaseModel):
    features: List[ProjectFeatures]
    labels: List[bool]

# Global model instance
model = None

def create_model():
    """Create a neural network model for project success prediction"""
    model = tf.keras.Sequential([
        tf.keras.layers.Dense(32, activation='relu', input_shape=(7,)),
        tf.keras.layers.BatchNormalization(),
        tf.keras.layers.Dropout(0.3),
        tf.keras.layers.Dense(16, activation='relu'),
        tf.keras.layers.BatchNormalization(),
        tf.keras.layers.Dropout(0.2),
        tf.keras.layers.Dense(8, activation='relu'),
        tf.keras.layers.Dense(1, activation='sigmoid')
    ])
    
    model.compile(
        optimizer=tf.keras.optimizers.Adam(learning_rate=0.001),
        loss='binary_crossentropy',
        metrics=['accuracy', tf.keras.metrics.AUC()]
    )
    
    return model

def preprocess_features(features: ProjectFeatures) -> np.ndarray:
    """Preprocess features for model input"""
    return np.array([
        features.quality_score / 10,
        features.technical_complexity / 10,
        np.log10(features.revenue_potential + 1) / 6,
        features.category_popularity,
        features.competition_level / 4,
        min(features.team_size / 10, 1),
        np.log10(features.activities_count + 1) / 3
    ]).reshape(1, -1)

def analyze_factors(features: ProjectFeatures, probability: float) -> Dict[str, List[str]]:
    """Analyze positive and negative factors"""
    positive = []
    negative = []
    
    # Quality analysis
    if features.quality_score >= 8:
        positive.append("Excellent quality score")
    elif features.quality_score < 5:
        negative.append("Low quality score needs improvement")
    
    # Revenue vs Complexity
    complexity_ratio = features.technical_complexity / 10
    revenue_ratio = min(features.revenue_potential / 500000, 1)
    
    if revenue_ratio > complexity_ratio * 1.5:
        positive.append("High revenue potential relative to complexity")
    elif revenue_ratio < complexity_ratio * 0.5:
        negative.append("Revenue may not justify complexity")
    
    # Competition
    if features.competition_level < 2:
        positive.append("Low competition in market")
    elif features.competition_level > 3:
        negative.append("High competition may impact success")
    
    # Team engagement
    if features.team_size > 3 and features.activities_count > 50:
        positive.append("Strong team engagement")
    elif features.team_size == 1 and features.activities_count < 10:
        negative.append("Limited team activity")
    
    # Category popularity
    if features.category_popularity > 0.7:
        positive.append("Popular category with proven demand")
    elif features.category_popularity < 0.3:
        negative.append("Niche category may limit growth")
    
    return {"positive": positive, "negative": negative}

@app.on_event("startup")
async def startup_event():
    """Initialize the model on startup"""
    global model
    model = create_model()
    logger.info("Model initialized successfully")

@app.get("/")
async def root():
    """Health check endpoint"""
    gpu_info = tf.config.list_physical_devices('GPU')
    return {
        "status": "healthy",
        "tensorflow_version": tf.__version__,
        "gpu_available": len(gpu_info) > 0,
        "gpu_devices": [str(gpu) for gpu in gpu_info]
    }

@app.post("/predict", response_model=PredictionResult)
async def predict_project_success(project: ProjectFeatures):
    """Predict project success probability using GPU-accelerated model"""
    try:
        # Preprocess features
        features = preprocess_features(project)
        
        # Make prediction
        with tf.device('/GPU:0' if tf.config.list_physical_devices('GPU') else '/CPU:0'):
            probability = float(model.predict(features, verbose=0)[0][0])
        
        # Determine risk level
        if probability > 0.7:
            risk_level = "low"
        elif probability > 0.4:
            risk_level = "medium"
        else:
            risk_level = "high"
        
        # Analyze factors
        factors = analyze_factors(project, probability)
        
        # Calculate confidence (based on prediction certainty)
        confidence = 1 - (2 * abs(0.5 - probability))
        
        return PredictionResult(
            success_probability=probability,
            risk_level=risk_level,
            confidence_score=confidence,
            factors=factors,
            gpu_accelerated=len(tf.config.list_physical_devices('GPU')) > 0
        )
    
    except Exception as e:
        logger.error(f"Prediction error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/train")
async def train_model(training_data: TrainingData):
    """Train the model with new data using GPU acceleration"""
    try:
        # Prepare training data
        X = np.array([preprocess_features(f).flatten() for f in training_data.features])
        y = np.array(training_data.labels).astype(float)
        
        # Train on GPU if available
        with tf.device('/GPU:0' if tf.config.list_physical_devices('GPU') else '/CPU:0'):
            history = model.fit(
                X, y,
                epochs=100,
                batch_size=32,
                validation_split=0.2,
                verbose=0,
                callbacks=[
                    tf.keras.callbacks.EarlyStopping(patience=10, restore_best_weights=True),
                    tf.keras.callbacks.ReduceLROnPlateau(patience=5)
                ]
            )
        
        # Get final metrics
        final_loss = history.history['loss'][-1]
        final_accuracy = history.history['accuracy'][-1]
        
        return {
            "status": "success",
            "epochs_trained": len(history.history['loss']),
            "final_loss": final_loss,
            "final_accuracy": final_accuracy,
            "gpu_accelerated": len(tf.config.list_physical_devices('GPU')) > 0
        }
    
    except Exception as e:
        logger.error(f"Training error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/batch_predict")
async def batch_predict(projects: List[ProjectFeatures]):
    """Batch prediction for multiple projects with GPU acceleration"""
    try:
        # Prepare all features
        features_array = np.vstack([preprocess_features(p) for p in projects])
        
        # Batch prediction on GPU
        with tf.device('/GPU:0' if tf.config.list_physical_devices('GPU') else '/CPU:0'):
            probabilities = model.predict(features_array, batch_size=128, verbose=0).flatten()
        
        results = []
        for project, prob in zip(projects, probabilities):
            risk_level = "low" if prob > 0.7 else "medium" if prob > 0.4 else "high"
            factors = analyze_factors(project, prob)
            confidence = 1 - (2 * abs(0.5 - prob))
            
            results.append({
                "success_probability": float(prob),
                "risk_level": risk_level,
                "confidence_score": confidence,
                "factors": factors
            })
        
        return {
            "predictions": results,
            "gpu_accelerated": len(tf.config.list_physical_devices('GPU')) > 0
        }
    
    except Exception as e:
        logger.error(f"Batch prediction error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/anomaly_detection")
async def detect_anomalies(values: List[float], threshold: float = 2.0):
    """Detect anomalies in data using statistical methods"""
    try:
        values_array = np.array(values)
        mean = np.mean(values_array)
        std = np.std(values_array)
        
        if std == 0:
            return {"anomalies": [], "mean": mean, "std": std}
        
        z_scores = np.abs((values_array - mean) / std)
        anomaly_indices = np.where(z_scores > threshold)[0].tolist()
        
        return {
            "anomalies": anomaly_indices,
            "mean": mean,
            "std": std,
            "threshold": threshold
        }
    
    except Exception as e:
        logger.error(f"Anomaly detection error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)