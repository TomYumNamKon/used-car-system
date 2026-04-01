import { ValuationService } from '@/services/ValuationService';
import { NextResponse } from 'next/server';

export class ValuationController {
    static async evaluateCar(request: Request) {
        try {
            const body = await request.json();
            
            // ลบ Number() ออก และส่งตัวแปรไปให้ครบ 3 ตัวตามที่ Service ต้องการ
            const lead = await ValuationService.calculateAndSaveValuation(
                body.carSpecs, 
                body.userId,     // <--- แก้ตรงนี้ ส่งไปตรงๆ เลย
                body.phone       // <--- เพิ่มตัวนี้เข้าไปด้วย
            );

            return NextResponse.json({ 
                success: true, 
                displayedPrice: lead.offered_price // ใช้ offered_price ตามที่คุณแก้ใน Service
            });
        } catch (error: any) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }
    }
}