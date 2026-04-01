import { LeadService } from '@/services/LeadService';
import { NextResponse } from 'next/server';

export class LeadController {
    static async getAllLeads() {
        try {
            const leads = await LeadService.fetchAllLeads();
            return NextResponse.json({ leads });
        } catch (error: any) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }
    }

    static async updateStatus(request: Request) {
        try {
            const body = await request.json();
            await LeadService.updateLeadStatus(body.id, body.status);
            return NextResponse.json({ success: true });
        } catch (error: any) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }
    }
}