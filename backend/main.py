from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List, Dict, Any
import pandas as pd
from model_pipeline import ML_Pipeline

app = FastAPI()
pipeline = ML_Pipeline()

# โครงสร้างสำหรับการทำนายราคา 1 คัน
class PredictRequest(BaseModel):
    year: int
    mileage: int
    tax: float
    mpg: float
    engineSize: float
    brand: str
    model: str
    transmission: str
    fuelType: str

@app.post("/predict")
async def predict(request: PredictRequest):
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
    
    price = pipeline.predictPrice(input_data)
    return {"predicted_price": float(price)}

# Endpoint สำหรับรับข้อมูล Array ไปรวมและ Preprocess
@app.post("/preprocess")
async def preprocess(data: List[Dict[str, Any]]):
    try:
        result = pipeline.preprocessData(data)
        return result
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
    
# --- ส่วนที่เพิ่มใหม่ ---

@app.get("/features")
async def get_features():
    """API สำหรับดึงรายการ ยี่ห้อ, เกียร์, ประเภทเชื้อเพลิง ทั้งหมด"""
    try:
        features = pipeline.getUniqueFeatures()
        return features
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.get("/models/{brand}")
async def get_models(brand: str):
    """API สำหรับดึงรุ่นรถตามยี่ห้อที่ระบุ เช่น /models/Audi"""
    try:
        models = pipeline.getModelsByBrand(brand)
        if not models:
            raise HTTPException(status_code=404, detail=f"ไม่พบรุ่นรถสำหรับยี่ห้อ {brand}")
        return {"brand": brand, "models": models}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/train")
async def train_model():
    """API สำหรับสั่ง Train โมเดลใหม่"""
    try:
        result = pipeline.trainModel()
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# วิธีรัน: uvicorn main:app --reload