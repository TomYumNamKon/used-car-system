from model_pipeline import ML_Pipeline
import pandas as pd

# เรียกใช้งานคลาส
pipeline = ML_Pipeline()

# # สร้างข้อมูลจำลอง (Mock Data)
# mock_data = {}


# print("\n=== 1. ทดสอบ preprocessData ===")
# result_preprocess = pipeline.preprocessData(mock_data) 
# print("ผลลัพธ์:", result_preprocess)

# print("\n=== 2. ทดสอบ trainModel (สร้างโมเดลก่อน) ===")
# # รัน Train เพื่อสร้างโมเดลและบันทึกเป็นไฟล์ .joblib ก่อน
# result_train = pipeline.trainModel()
# print("ผลลัพธ์การ Train:", result_train)

# print("\n=== 3. ทดสอบ predictPrice (ทำนายราคา) ===")
# # พอมีโมเดลแล้ว ค่อยเอามาทดสอบทำนายราคา
# input_for_predict = pd.DataFrame([{
#     "year": 2020, "mileage": 50000, "tax": 145, "mpg": 55.4, 
#     "engineSize": 1.6, "brand": "Audi", "model": "A3", 
#     "transmission": "Automatic", "fuelType": "Petrol"
# }])

# price = pipeline.predictPrice(input_for_predict)
# print(f"ราคาที่ทำนายได้: {price}")

print(pipeline.getModelsByBrand("mercedes"))