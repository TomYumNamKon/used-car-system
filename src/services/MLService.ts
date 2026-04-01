import prisma from '@/lib/prisma';

export class MLService {
    private static pythonAPIUrl: string = process.env.PYTHON_API_URL || 'http://127.0.0.1:8000';

    static async startAsyncRetrainTask() {
        const dataset = await this.fetchDatasetForTraining();
        
        // ยิงไป Python แบบ Fire & Forget (ไม่ต้อง await)
        fetch(`${this.pythonAPIUrl}/retrain`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ dataset })
        }).catch(e => console.error("Trigger retrain failed:", e));
    }

    private static async fetchDatasetForTraining() {
        return await prisma.salesDataset.findMany();
    }
}