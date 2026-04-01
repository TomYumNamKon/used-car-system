import prisma from '@/lib/prisma';

export class MLService {
    private static pythonAPIUrl: string = process.env.PYTHON_API_URL || 'http://127.0.0.1:8000';

    static async startAsyncRetrainTask() {
        const dataset = await this.fetchDatasetForTraining();
        
        // 1. สั่ง Preprocess และใส่ await เพื่อรอให้เสร็จ
        const prepRes = await fetch(`${this.pythonAPIUrl}/preprocess`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(dataset)
        });
        if (!prepRes.ok) throw new Error("เตรียมข้อมูล (Preprocess) ไม่สำเร็จ");

        // 2. สั่ง Train และใส่ await เพื่อรอให้สอนโมเดลเสร็จ
        const trainRes = await fetch(`${this.pythonAPIUrl}/train`, {
            method: 'POST'
        });
        if (!trainRes.ok) throw new Error("สอนโมเดล (Train) ไม่สำเร็จ");

        // 3. คืนค่าผลลัพธ์ความแม่นยำกลับไป
        return await trainRes.json();
    }

    private static async fetchDatasetForTraining() {
        return await prisma.salesDataset.findMany();
    }

    static async getFeatures() {
        const response = await fetch(`${this.pythonAPIUrl}/features`, { cache: 'no-store' });
        if (!response.ok) throw new Error("ดึงข้อมูลตัวเลือกจาก Python ไม่สำเร็จ");
        return await response.json();
    }

    static async getModelsByBrand(brand: string) {
        const response = await fetch(`${this.pythonAPIUrl}/models/${brand}`, { cache: 'no-store' });
        if (!response.ok) throw new Error(`ไม่พบรุ่นรถสำหรับยี่ห้อ ${brand}`);
        return await response.json();
    }
}