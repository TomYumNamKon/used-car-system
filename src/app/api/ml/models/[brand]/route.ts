import { MLController } from '@/controllers/MLController';

// แก้ไขประเภทของ params ให้เป็น Promise
export async function GET(request: Request, context: { params: Promise<{ brand: string }> }) {
  return await MLController.getModelsByBrand(request, context);
}