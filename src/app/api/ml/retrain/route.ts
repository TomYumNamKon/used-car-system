import { MLController } from '@/controllers/MLController';

// ❌ ห้ามมีคำว่า default 
// ✅ ต้องเป็น export async function POST() แบบนี้ครับ
export async function POST() {
  return await MLController.triggerRetrain();
}