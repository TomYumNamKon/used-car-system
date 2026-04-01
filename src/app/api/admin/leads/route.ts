import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // ดึงข้อมูลการประเมินรถที่สถานะยังเป็น "PENDING" (รอดำเนินการ)
    const leads = await prisma.valuationLead.findMany({
      where: { status: 'PENDING' },
      include: { user: true }, // join ตาราง User มาด้วย เพื่อให้ดึงชื่อ username ได้
      orderBy: { created_at: 'desc' }
    });

    return NextResponse.json({ leads });
  } catch (error) {
    return NextResponse.json({ error: 'ไม่สามารถดึงข้อมูล Leads ได้' }, { status: 500 });
  }
}