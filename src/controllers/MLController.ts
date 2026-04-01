import { MLService } from '@/services/MLService';
import { NextResponse } from 'next/server';

export class MLController {
    static async triggerRetrain() {
        try {
            // ระบบจะรอ (await) อยู่ตรงนี้จนกว่าขั้นตอนใน MLService จะเสร็จทั้งหมด
            const result = await MLService.startAsyncRetrainTask();

            // เมื่อเสร็จแล้ว ค่อยตอบกลับหน้าเว็บ
            return NextResponse.json(
                { 
                    message: "เทรนโมเดลเสร็จสมบูรณ์แล้ว!",
                    data: result // ส่งข้อมูลความแม่นยำ (Metrics) แนบกลับไปด้วย
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