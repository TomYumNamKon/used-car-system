import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET() {
  const setting = await prisma.systemSetting.findUnique({ where: { id: 'system_config' } });
  return NextResponse.json({ marginRate: setting?.margin_rate ?? 0.2 });
}

export async function POST(request: Request) {
  const { marginRate } = await request.json();
  const updated = await prisma.systemSetting.upsert({
    where: { id: 'system_config' },
    update: { margin_rate: marginRate },
    create: { id: 'system_config', margin_rate: marginRate }
  });
  return NextResponse.json(updated);
}