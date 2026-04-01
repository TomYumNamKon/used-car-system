import { MLController } from '@/controllers/MLController';

// สร้าง Method GET เพื่อให้หน้าเว็บ fetch ข้อมูลได้
export async function GET() {
  // โยนหน้าที่ให้ MLController จัดการดึงข้อมูลและตอบกลับ
  return await MLController.getFeatures();
}