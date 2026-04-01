import prisma from '@/lib/prisma';

export class LeadService {
    static async fetchAllLeads() {
        return await prisma.valuationLead.findMany({
            orderBy: { created_at: 'desc' },
            include: { user: { select: { username: true } } }
        });
    }

    static async updateLeadStatus(id: string, status: 'PENDING' | 'CONTACTED') {
        return await prisma.valuationLead.update({
            where: { id },
            data: { status }
        });
    }
}