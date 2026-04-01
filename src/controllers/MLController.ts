import { MLService } from '@/services/MLService';
import { NextResponse } from 'next/server';

export class MLController {
    static async triggerRetrain() {
        try {
            // ใส่ await เพื่อให้เซิร์ฟเวอร์รอจนกว่าโมเดลจะเทรนเสร็จ
            const result = await MLService.startAsyncRetrainTask();

            // พอเสร็จแล้วค่อยตอบกลับหน้าเว็บ
            return NextResponse.json(
                { 
                    message: "เทรนโมเดลเสร็จสมบูรณ์แล้ว!",
                    data: result // ส่งค่าความแม่นยำกลับไปด้วย
                }, 
                { status: 200 }
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

    static async getModelsByBrand(request: Request, context: { params: Promise<{ brand: string }> }) {
        try {
            const params = await context.params; 
            const data = await MLService.getModelsByBrand(params.brand);
            return NextResponse.json(data);
        } catch (error: any) {
            return NextResponse.json({ error: error.message }, { status: 404 });
        }
    }
}