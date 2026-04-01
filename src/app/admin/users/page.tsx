'use client';
import { useEffect, useState } from 'react';

export default function AdminUsersPage() {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    // โครงสร้างการทำงานคงเดิม ห้ามเปลี่ยน
    fetch('/api/admin/users')
      .then(res => res.json())
      .then(data => setUsers(data.users || []));
  }, []);

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto font-sans relative z-10">
      
      {/* --- ส่วนหัวข้อแบบ Gradient เหมือนหน้าอื่น --- */}
      <div className="mb-8">
        <h1 className="text-3xl font-black text-slate-800 tracking-tight drop-shadow-sm">
          รายชื่อผู้ขายทั้งหมด
        </h1>
        <p className="text-slate-500 mt-2 font-medium">จัดการและตรวจสอบรายชื่อผู้ใช้งานในระบบ</p>
      </div>

      {/* --- ตารางแบบ Glassmorphism --- */}
      <div className="bg-white/80 backdrop-blur-xl border border-slate-200 rounded-3xl shadow-xl shadow-slate-200/40 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-slate-700 whitespace-nowrap">
            <thead className="bg-slate-50/50 border-b border-slate-200/80 text-sm uppercase tracking-wider font-bold text-slate-500">
              <tr>
                <th className="p-5 pl-8">Username</th>
                <th className="p-5">เบอร์โทรศัพท์</th>
                <th className="p-5">Role</th>
                <th className="p-5 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {users.map((user: any) => (
                <tr key={user.id} className="hover:bg-blue-50/50 transition-colors group">
                  <td className="p-5 pl-8 font-bold text-slate-800">{user.username}</td>
                  <td className="p-5 font-medium text-slate-600">{user.phone}</td>
                  <td className="p-5">
                    {/* Badge ไล่เฉดสีตาม Role */}
                    <span className={`px-3 py-1.5 rounded-lg text-xs font-bold tracking-wide shadow-sm border ${
                      user.role === 'ADMIN' 
                        ? 'bg-gradient-to-r from-purple-100 to-fuchsia-100 text-purple-700 border-purple-200' 
                        : 'bg-gradient-to-r from-emerald-100 to-teal-100 text-emerald-700 border-emerald-200'
                    }`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="p-5 text-center">
                    <button className="px-4 py-2 text-sm font-bold text-blue-600 bg-blue-50 hover:bg-blue-600 hover:text-white rounded-xl transition-all duration-300 shadow-sm active:scale-95 group-hover:opacity-100">
                      ดูข้อมูล
                    </button>
                  </td>
                </tr>
              ))}
              
              {/* กรณีไม่มีข้อมูล */}
              {users.length === 0 && (
                <tr>
                  <td colSpan={4} className="p-10 text-center text-slate-400 italic font-medium">
                    กำลังโหลดข้อมูล หรือ ยังไม่มีรายชื่อผู้ใช้งาน...
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}