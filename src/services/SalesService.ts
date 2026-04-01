import prisma from '@/lib/prisma';

export class SalesService {
    static async processSalesRecord(record: any) {
        return await prisma.salesDataset.create({
            data: {
                car_specs: record.carSpecs,
                actual_sale_price: Number(record.actualPrice)
            }
        });
    }

    static async parseAndSaveCSV(parsedArray: any[]) {
        await prisma.salesDataset.createMany({
            data: parsedArray.map(item => ({
                car_specs: item.specs,
                actual_sale_price: Number(item.price)
            }))
        });
        return true;
    }
}