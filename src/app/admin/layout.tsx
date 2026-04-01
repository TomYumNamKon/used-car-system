'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const menuItems = [
    { name: 'รายชื่อผู้ใช้งาน', href: '/admin/users', icon: '👤' },
    { name: 'ประเมินราคารถ', href: '/admin/evaluate', icon: '🚙' },
    { name: 'ข้อมูลการขาย', href: '/admin/sales', icon: '📊' },
    { name: 'ตั้งค่าระบบ', href: '/admin/settings', icon: '⚙️' },
  ];

  return (
    <div className="flex min-h-screen bg-slate-50 font-sans overflow-hidden">
      
      {/* Sidebar ฝั่งซ้าย */}
      <aside className="w-64 bg-white/80 backdrop-blur-xl border-r border-slate-200 flex flex-col shadow-sm z-20">
        <div className="p-6 border-b border-slate-100 text-center">
          <h2 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 tracking-tight drop-shadow-sm">
            Admin Panel
          </h2>
        </div>
        
        <nav className="flex-1 p-4 space-y-2">
          {menuItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link 
                key={item.href} 
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 font-bold ${
                  isActive 
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-200 translate-x-1' 
                    : 'text-slate-500 hover:bg-slate-100 hover:text-blue-600'
                }`}
              >
                <span className="text-lg grayscale-[50%]">{item.icon}</span>
                {item.name}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-100">
          <button 
            onClick={() => {
              localStorage.removeItem('user');
              window.location.href = '/login';
            }} 
            className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-red-500 font-bold hover:bg-red-50 hover:text-red-600 transition-colors border border-transparent hover:border-red-100 active:scale-95"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            ออกจากระบบ
          </button>
        </div>
      </aside>

      {/* เนื้อหาหลักทางขวา */}
      <main className="flex-1 relative overflow-y-auto">
        
        {/* --- ของตกแต่งพื้นหลัง (Glowing Blobs) สำหรับหน้า Admin ทั้งหมด --- */}
        <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-blue-300 rounded-full mix-blend-multiply filter blur-[120px] opacity-40 pointer-events-none"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-indigo-300 rounded-full mix-blend-multiply filter blur-[120px] opacity-40 pointer-events-none"></div>
        
        <div className="relative z-10 min-h-full">
          {children}
        </div>
        
      </main>
      
    </div>
  );
}