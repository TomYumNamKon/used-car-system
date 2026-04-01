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
}