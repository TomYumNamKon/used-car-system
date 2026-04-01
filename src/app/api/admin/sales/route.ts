import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const sales = await prisma.salesDataset.findMany({
      orderBy: { sold_at: 'desc' }
    });
    return NextResponse.json(sales);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch sales data' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    const newSale = await prisma.salesDataset.create({
      data: {
        car_specs: body.car_specs, 
        actual_sale_price: body.actual_sale_price,
      }
    });
    
    return NextResponse.json(newSale, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create sales record' }, { status: 500 });
  }
}