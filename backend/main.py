from fastapi import FastAPI, BackgroundTasks
from pydantic import BaseModel
from typing import List, Dict, Any
from model_pipeline import ML_Pipeline

app = FastAPI()
pipeline = ML_Pipeline()

# Pydantic Schemas
class PredictRequest(BaseModel):
    # Categorical Features (ส่งมาเป็น String)
    brand: str
    model: str
    transmission: str
    fuelType: str
    
    # Numeric Features (ส่งมาเป็นตัวเลข)
    year: int
    mileage: int
    tax: int
    mpg: float        
    engineSize: float  

class RetrainRequest(BaseModel):
    dataset: List[Dict[str, Any]]

# POST_predict
@app.post("/predict")
async def predict(request: PredictRequest):
    # สร้าง DataFrame โดยเรียงลำดับให้ตรงกับที่เทรนมา
    input_data = pd.DataFrame([{
        'year': request.year,
        'mileage': request.mileage,
        'tax': request.tax,
        'mpg': request.mpg,
        'engineSize': request.engineSize,
        'brand': request.brand,
        'model': request.model,
        'transmission': request.transmission,
        'fuelType': request.fuelType
    }])
    
    # สั่ง Predict...
    prediction = pipeline.predict(input_data)
    return {"predicted_price": float(prediction[0])}

# POST_retrain
@app.post("/retrain", status_code=202)
def retrain_model(request: RetrainRequest, background_tasks: BackgroundTasks):
    # โยนเข้า Background Task ฝั่ง Python ด้วย เพื่อไม่ให้ Next.js Connection Timeout
    background_tasks.add_task(pipeline.trainModel, request.dataset)
    
    return {"message": "Model training started in background"}

# วิธีรัน: uvicorn main:app --reload