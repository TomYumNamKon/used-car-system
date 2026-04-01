'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const menuItems = [
    { name: 'รายชื่อผู้ใช้งาน', href: '/admin/users' },
    { name: 'ประเมินราคารถ', href: '/' }, // หรือหน้าประเมินของแอดมิน
    { name: 'ข้อมูลการขาย', href: '/admin/sales' },
    { name: 'ตั้งค่าระบบ', href: '/admin/settings' },
  ];

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar ฝั่งซ้าย */}
      <aside className="w-64 bg-slate-800 text-white flex flex-col">
        <div className="p-6 text-xl font-bold border-b border-slate-700">Admin Panel</div>
        <nav className="flex-1 p-4 space-y-2">
          {menuItems.map((item) => (
            <Link 
              key={item.href} 
              href={item.href}
              className={`block p-3 rounded transition ${
                pathname === item.href ? 'bg-blue-600' : 'hover:bg-slate-700'
              }`}
            >
              {item.name}
            </Link>
          ))}
        </nav>
        <div className="p-4 border-t border-slate-700">
          <button onClick={() => window.location.href = '/login'} className="text-red-400 hover:text-red-300">ออกจากระบบ</button>
        </div>
      </aside>

      {/* เนื้อหาหลักทางขวา */}
      <main className="flex-1 p-8 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}