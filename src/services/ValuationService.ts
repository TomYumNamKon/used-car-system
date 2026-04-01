import prisma from '@/lib/prisma';

export class ValuationService {
    // ลองเปลี่ยนเป็น localhost ดูถ้า 127.0.0.1 มีปัญหาใน Node.js บางเวอร์ชัน
    private static pythonAPIUrl: string = process.env.PYTHON_API_URL || 'http://127.0.0.1:8000';

    static async calculateAndSaveValuation(carSpecs: any, userId: string, phone: string) {
        console.log("🟢 1. เริ่มคำนวณราคา - กำลังเรียก Python AI...");
        const actualPrice = await this.callPythonAI(carSpecs);
        const offeredPrice = actualPrice * 0.8;

        console.log(`🟢 2. ได้ราคาจาก AI แล้ว: ${actualPrice} - กำลังบันทึกลงฐานข้อมูล...`);
        try {
            const lead = await prisma.valuationLead.create({
                data: {
                    user_id: userId,                      
                    car_specs: JSON.stringify(carSpecs),  
                    ai_price: actualPrice,                
                    offered_price: offeredPrice,          
                    status: 'PENDING',
                    phone: phone                          
                }
            });
            console.log("🟢 3. บันทึกข้อมูลสำเร็จ! จบการทำงาน");
            return lead;
        } catch (dbError) {
            console.error("🔴 Prisma Database Error (อาจจะตารางผิด หรือ DB ล็อก):", dbError);
            throw new Error("บันทึกข้อมูลลงฐานข้อมูลไม่สำเร็จ");
        }
    }

    private static async callPythonAI(carSpecs: any): Promise<number> {
        try {
            console.log(`-> 🚀 กำลังยิง fetch ไปที่: ${this.pythonAPIUrl}/predict`);
            const response = await fetch(`${this.pythonAPIUrl}/predict`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(carSpecs)
            });
            
            if (!response.ok) {
                console.error("🔴 Python ตอบกลับมาเป็น Error Code:", response.status);
                throw new Error("AI Prediction failed");
            }
            
            const data = await response.json();
            return data.predicted_price;
        } catch (error) {
            console.error("🔴 เชื่อมต่อ Python AI ไม่สำเร็จ (Fetch Error):", error);
            throw error;
        }
    }
}