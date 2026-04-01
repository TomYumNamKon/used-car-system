import prisma from '@/lib/prisma';

export class ValuationService {
    private static pythonAPIUrl: string = process.env.PYTHON_API_URL || 'http://127.0.0.1:8000';

    static async calculateAndSaveValuation(carSpecs: any, userId: string, phone: string) {
        const actualPrice = await this.callPythonAI(carSpecs);
        const offeredPrice = actualPrice * 0.8;

        const lead = await prisma.valuationLead.create({
            data: {
                user_id: userId,                      // ใช้ user_id ตาม model (และส่งเป็น String)
                car_specs: JSON.stringify(carSpecs),  // แปลง object เป็น string ตามที่ระบุใน model
                ai_price: actualPrice,                // ใช้ ai_price ตาม model
                offered_price: offeredPrice,          // ใช้ offered_price ตาม model
                status: 'PENDING',
                phone: phone                          // เพิ่ม phone ตาม model
            }
        });

        return lead;
    }

    private static async callPythonAI(carSpecs: any): Promise<number> {
        const response = await fetch(`${this.pythonAPIUrl}/predict`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(carSpecs)
        });
        if (!response.ok) throw new Error("AI Prediction failed");
        const data = await response.json();
        return data.predicted_price;
    }
}