import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <div className="max-w-3xl text-center space-y-6 bg-white p-10 rounded-2xl shadow-xl border border-gray-100">
        <h1 className="text-4xl md:text-5xl font-extrabold text-blue-600 tracking-tight">
          ระบบประเมินราคารถยนต์มือสอง
        </h1>
        <p className="text-lg text-gray-600 leading-relaxed">
          ยินดีต้อนรับสู่ระบบของเรา! เราใช้ AI ในการวิเคราะห์ข้อมูลตลาด
          เพื่อให้คุณทราบราคาประเมินและราคารับซื้อรถยนต์ที่แม่นยำและยุติธรรมที่สุด
        </p>
        
        <div className="flex flex-col sm:flex-row justify-center gap-4 pt-6">
          
          <Link 
            href="/login" 
            className="px-8 py-3 bg-white text-blue-600 font-bold border-2 border-blue-600 rounded-lg hover:bg-blue-50 transition"
          >
            เข้าสู่ระบบ (พนักงาน)
          </Link>
        </div>
      </div>

      <div className="mt-12 text-center text-sm text-gray-400">
        <p>© 2026 Used Car Valuation System. All rights reserved.</p>
      </div>
    </div>
  );
}