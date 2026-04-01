import { SalesService } from '@/services/SalesService';
import { NextResponse } from 'next/server';

export class SalesController {
    static async addManualRecord(request: Request) {
        try {
            const body = await request.json();
            await SalesService.processSalesRecord(body);
            return NextResponse.json({ success: true });
        } catch (error: any) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }
    }

    static async uploadCSV(request: Request) {
        try {
            // สมมติว่าแกะ Request เอา Array ออกมาแล้ว
            const body = await request.json(); 
            await SalesService.parseAndSaveCSV(body.parsedData);
            return NextResponse.json({ success: true });
        } catch (error: any) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }
    }
}