import { MLService } from '@/services/MLService';
import { NextResponse } from 'next/server';

export class MLController {
    static async triggerRetrain() {
        try {
            // สั่งรัน Async Task เบื้องหลัง
            await MLService.startAsyncRetrainTask();

            // รีบตอบกลับ Admin ไม่ให้เว็บค้าง
            return NextResponse.json(
                { message: "เริ่มกระบวนการสอนโมเดลเบื้องหลังแล้ว" }, 
                { status: 202 } // 202 = Accepted
            );
        } catch (error: any) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }
        
    }
    static async getFeatures() {
        try {
            const data = await MLService.getFeatures();
            return NextResponse.json(data);
        } catch (error: any) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }
    }

    // ดึงรุ่นรถตามยี่ห้อ
    static async getModelsByBrand(request: Request, context: { params: Promise<{ brand: string }> }) {
        try {
            // ต้องใส่ await เพื่อแกะกล่อง params ออกมาก่อน!
            const params = await context.params; 
            
            const data = await MLService.getModelsByBrand(params.brand);
            return NextResponse.json(data);
        } catch (error: any) {
            return NextResponse.json({ error: error.message }, { status: 404 });
        }
    }
}