import prisma from '@/lib/prisma';

export class MLService {
    private static pythonAPIUrl: string = process.env.PYTHON_API_URL || 'http://127.0.0.1:8000';

    static async startAsyncRetrainTask() {
        const dataset = await this.fetchDatasetForTraining();
        
        // แก้: ยิงไปที่ /preprocess และส่ง dataset ที่เป็น Array เข้าไปตรงๆ
        fetch(`${this.pythonAPIUrl}/preprocess`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(dataset) // เอาปีกกา { } ออก เพื่อส่ง Array ตรงๆ
        }).catch(e => console.error("Trigger preprocess failed:", e));
    }

    private static async fetchDatasetForTraining() {
        return await prisma.salesDataset.findMany();
    }
}