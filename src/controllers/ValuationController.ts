import { ValuationService } from '@/services/ValuationService';
import { prisma } from '@/lib/prisma'; // ต้องเรียกใช้ prisma
import { NextResponse } from 'next/server';

export class ValuationController {
    static async evaluateCar(request: Request) {
        try {
            const body = await request.json();
            
            // 1. ตรวจบัตรประชาชน: เช็คว่า User มีในระบบจริงๆ ไหม
            const user = await prisma.user.findUnique({
                where: { id: body.userId }
            });

            if (!user) {
                throw new Error("ไม่พบข้อมูลผู้ใช้งาน กรุณาเข้าสู่ระบบใหม่");
            }
            
            // 2. ให้ Service ทำนายราคาตามปกติ
            const lead = await ValuationService.calculateAndSaveValuation(
                body.carSpecs, 
                body.userId, 
                body.phone
            );

            // 3. แบ่งยศ (Role-Based Response)
            return NextResponse.json({ 
                success: true, 
                displayedPrice: lead.offered_price, // ราคาที่เสนอซื้อ (เห็นทุกคน)
                // ถ้าเป็น ADMIN ส่งราคา AI แท้ๆ กลับไปด้วย
                aiPrice: user.role === 'ADMIN' ? lead.ai_price : null 
            });
        } catch (error: any) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }
    }
}