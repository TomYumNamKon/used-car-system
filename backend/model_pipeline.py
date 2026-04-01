import pandas as pd
import os
import joblib
from typing import List, Dict, Any
from sklearn.model_selection import train_test_split
from sklearn.compose import ColumnTransformer
from sklearn.preprocessing import StandardScaler, OneHotEncoder
from sklearn.pipeline import Pipeline
from sklearn.metrics import mean_absolute_error, r2_score
from lightgbm import LGBMRegressor # แก้ไข: Import LightGBM ให้ถูกต้อง

class ML_Pipeline:
    def __init__(self):
        # กำหนดชื่อไฟล์สำหรับเซฟ/โหลดโมเดล
        self.model_path = 'car_price_model.joblib'
        self.model = None
        
        # ตอนเปิดเซิร์ฟเวอร์ ถ้ามีโมเดลที่ Train ไว้แล้วให้โหลดขึ้นมาเลย
        if os.path.exists(self.model_path):
            self.model = joblib.load(self.model_path)
            print("✅ โหลดโมเดลที่เทรนไว้แล้วสำเร็จพร้อมใช้งาน")
        else:
            print("⚠️ ยังไม่มีไฟล์โมเดล กรุณาเรียก API เพื่อ Train โมเดลก่อน")

    def predictPrice(self, input_data: pd.DataFrame):
        # ถอด 0.0 ออก และใช้โมเดลจริงทำนาย
        if self.model is None:
            raise ValueError("ยังไม่ได้ Train โมเดล ไม่สามารถทำนายราคาได้")
            
        prediction = self.model.predict(input_data)
        return float(prediction[0])

    def trainModel(self):
        print("--- 1. โหลดข้อมูลสำหรับ Train ---")
        if not os.path.exists('train_used_cars.csv') or not os.path.exists('test_used_cars.csv'):
            raise FileNotFoundError("ไม่พบไฟล์ Train/Test กรุณารัน preprocess ข้อมูลก่อน")

        train_df = pd.read_csv('train_used_cars.csv')
        test_df = pd.read_csv('test_used_cars.csv')

        X_train = train_df.drop('price', axis=1)
        y_train = train_df['price']
        X_test = test_df.drop('price', axis=1)
        y_test = test_df['price']

        numeric_features = ['year', 'mileage', 'tax', 'mpg', 'engineSize']
        categorical_features = ['brand', 'model', 'transmission', 'fuelType']
        
        print(f"Dataset loaded: Train {X_train.shape}, Test {X_test.shape}")

        print("--- 2. สร้างตัวแปลงข้อมูลและ Pipeline ---")
        preprocessor = ColumnTransformer(
            transformers=[
                ('num', StandardScaler(), numeric_features),
                ('cat', OneHotEncoder(handle_unknown='ignore'), categorical_features)
            ])

        # แก้ไข: ใส่พารามิเตอร์เข้าไปใน LGBMRegressor โดยตรง ไม่ต้องใช้ Dict "model__"
        self.model = Pipeline(steps=[
            ('preprocessor', preprocessor),
            ('model', LGBMRegressor(
                n_estimators=250,
                learning_rate=0.07,
                num_leaves=40,
                random_state=42
            ))
        ])

        print("--- 3. เริ่มทำการ Train ด้วย LightGBM ---")
        self.model.fit(X_train, y_train)

        print("--- 4. ประเมินผลโมเดล (Evaluation) ---")
        y_pred = self.model.predict(X_test)
        mae = mean_absolute_error(y_test, y_pred)
        r2 = r2_score(y_test, y_pred)
        
        print(f"ผลลัพธ์: MAE = {mae:.2f}, R-Squared = {r2:.4f}")

        print("--- 5. บันทึกโมเดล ---")
        joblib.dump(self.model, self.model_path)
        print(f"✅ บันทึกโมเดลลงไฟล์ '{self.model_path}' เรียบร้อย")

        return {
            "status": "success",
            "message": "Model trained successfully",
            "metrics": {
                "MAE": round(mae, 2),
                "R2": round(r2, 4)
            }
        }

    def preprocessData(self, data: List[Dict[str, Any]]):
        print("--- 1. โหลดข้อมูล ---")
        
        # 1.1 แปลงข้อมูลใหม่จาก JSON (Array of Dicts) เป็น DataFrame
        df_new = pd.DataFrame(data)
        
        # 1.2 โหลดข้อมูลพื้นฐานจาก CSV
        base_csv_path = 'combined_cars.csv'
        if os.path.exists(base_csv_path):
            df_base = pd.read_csv(base_csv_path)
            # นำข้อมูลเก่า (CSV) และใหม่ (JSON) มาต่อกัน
            df_combined = pd.concat([df_base, df_new], ignore_index=True)
            print(f"รวมข้อมูลสำเร็จ: ไฟล์เดิม {len(df_base)} แถว + ข้อมูลใหม่ {len(df_new)} แถว = รวม {len(df_combined)} แถว")
        else:
            print(f"⚠️ ไม่พบไฟล์พื้นฐาน '{base_csv_path}' จะดำเนินการโดยใช้เฉพาะข้อมูลใหม่เท่านั้น")
            df_combined = df_new

        # เช็คดักความผิดพลาด
        if df_combined.empty:
            raise ValueError("ไม่พบข้อมูลสำหรับการประมวลผล")
        if 'price' not in df_combined.columns:
            raise ValueError("ข้อมูลไม่มีคอลัมน์ 'price' ไม่สามารถแบ่ง Train/Test ได้")

        print("--- 2. Data Cleaning ---")
        df_combined.drop_duplicates(inplace=True)
        df_combined = df_combined[df_combined['year'] <= 2024]
        df_combined = df_combined[df_combined['engineSize'] > 0]

        # ตัด Outliers
        Q1 = df_combined['price'].quantile(0.25)
        Q3 = df_combined['price'].quantile(0.75)
        IQR = Q3 - Q1
        df_cleaned = df_combined[(df_combined['price'] >= (Q1 - 1.5 * IQR)) & (df_combined['price'] <= (Q3 + 1.5 * IQR))]

        print("--- 3. แบ่งข้อมูล Train / Test ---")
        X = df_cleaned.drop('price', axis=1)
        y = df_cleaned['price']

        X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

        train_data = pd.concat([X_train, y_train], axis=1)
        test_data = pd.concat([X_test, y_test], axis=1)

        print("--- 4. Export ข้อมูล ---")
        train_data.to_csv('train_used_cars.csv', index=False)
        test_data.to_csv('test_used_cars.csv', index=False)
        print("✅ บันทึกไฟล์ 'train_used_cars.csv' และ 'test_used_cars.csv' เรียบร้อย!")
        
        # คืนค่ากลับไปให้ API ทราบว่าสำเร็จ
        return {
            "status": "success", 
            "message": "Data preprocessed and exported successfully",
            "total_rows_after_cleaning": len(df_cleaned)
        }
    def getUniqueFeatures(self):
        """ดึงรายการตัวเลือกทั้งหมดที่มีในระบบ (ยี่ห้อ, เกียร์, เชื้อเพลิง)"""
        if not os.path.exists('train_used_cars.csv'):
            raise ValueError("ยังไม่ได้เตรียมข้อมูล (Preprocess) ไม่พบไฟล์ข้อมูล")
            
        df = pd.read_csv('train_used_cars.csv')
        
        return {
            "brands": sorted(df['brand'].dropna().unique().tolist()),
            "transmissions": sorted(df['transmission'].dropna().unique().tolist()),
            "fuelTypes": sorted(df['fuelType'].dropna().unique().tolist())
        }

    def getModelsByBrand(self, brand: str):
        """ดึงรายชื่อรุ่นรถ (Model) โดยกรองจากยี่ห้อ (Brand) ที่ส่งเข้ามา"""
        if not os.path.exists('train_used_cars.csv'):
            raise ValueError("ยังไม่ได้เตรียมข้อมูล (Preprocess) ไม่พบไฟล์ข้อมูล")
            
        df = pd.read_csv('train_used_cars.csv')
        
        # กรองข้อมูลเอาเฉพาะแถวที่ brand ตรงกับที่ส่งมา แล้วดึง model ที่ไม่ซ้ำกัน
        filtered_df = df[df['brand'].str.lower() == brand.lower()]
        models = sorted(filtered_df['model'].dropna().unique().tolist())
        
        return models