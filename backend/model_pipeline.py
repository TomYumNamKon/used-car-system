import pickle
import os

class ML_Pipeline:
    MODEL_PATH = "model.pkl"
    

    def preprocessData(self, data: dict):
        # ทำ Dummy feature extraction (เปลี่ยนเป็น logic จริงได้เลย)
        return [list(data.values())] 

    def predictPrice(self, processedData) -> float:
        if self.loadModel(self.MODEL_PATH):
            # จำลองการ predict
            # return self.model.predict(processedData)[0]
            return 500000.0 # Dummy price
        return 0.0

    def trainModel(self, dataset: list):
        print(f"Training started with {len(dataset)} records...")
        # ใส่ logic: extract X, y -> model.fit(X,y)
        self.saveModel(self.MODEL_PATH)
        print("Training completed and model saved!")

    def saveModel(self, path: str) -> bool:
        # with open(path, 'wb') as f:
        #     pickle.dump(self.model, f)
        return True

    def loadModel(self, path: str) -> bool:
        # if os.path.exists(path):
        #     with open(path, 'rb') as f:
        #         self.model = pickle.load(f)
        #     return True
        return True