// src/controllers/ValuationController.ts
import { ValuationService } from '@/services/ValuationService';
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export class ValuationController {
    static async evaluateCar(request: Request) {
        try {
            const body = await request.json();
            const { userId, carSpecs, phone } = body;

            // 1. ดึงข้อมูล User เพื่อดู Role
            const user = await prisma.user.findUnique({ where: { id: userId } });
            if (!user) throw new Error("ไม่พบผู้ใช้งาน");

            // 2. ประเมินราคาและบันทึก
            const lead = await ValuationService.calculateAndSaveValuation(carSpecs, userId, phone);

            // 3. ถ้าเป็น Admin ให้ส่งราคา AI ไปด้วย
            return NextResponse.json({
                success: true,
                offeredPrice: lead.offered_price,
                // ส่ง aiPrice เฉพาะ Admin เท่านั้น
                aiPrice: user.role === 'ADMIN' ? lead.ai_price : null 
            });
        } catch (error: any) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }
    }
}