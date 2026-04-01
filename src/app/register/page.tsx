'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function RegisterPage() {
  const [form, setForm] = useState({ username: '', phone: '', password: '', confirmPassword: '' });
  const router = useRouter();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) return alert("รหัสผ่านไม่ตรงกัน");

    const res = await fetch('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        username: form.username,
        phone: form.phone,
        password: form.password
      }),
    });

    if (res.ok) {
      alert("สมัครสมาชิกสำเร็จ!");
      router.push('/login');
    } else {
      const data = await res.json();
      alert(data.error || "เกิดข้อผิดพลาด");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <form onSubmit={handleRegister} className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md">
        <h1 className="text-2xl font-bold mb-6 text-gray-800 text-center">สมัครเป็นผู้ขาย (Seller)</h1>
        <div className="space-y-4">
          <input type="text" placeholder="ชื่อผู้ใช้งาน (Username)" required className="w-full p-3 border rounded-lg text-black"
            onChange={(e) => setForm({...form, username: e.target.value})} />
          <input type="text" placeholder="เบอร์โทรศัพท์" required className="w-full p-3 border rounded-lg text-black"
            onChange={(e) => setForm({...form, phone: e.target.value})} />
          <input type="password" placeholder="รหัสผ่าน" required className="w-full p-3 border rounded-lg text-black"
            onChange={(e) => setForm({...form, password: e.target.value})} />
          <input type="password" placeholder="ยืนยันรหัสผ่าน" required className="w-full p-3 border rounded-lg text-black"
            onChange={(e) => setForm({...form, confirmPassword: e.target.value})} />
          
          <button className="w-full bg-green-600 text-white font-bold py-3 rounded-lg hover:bg-green-700 transition">
            สมัครสมาชิก
          </button>
        </div>
        <p className="mt-4 text-center text-sm text-gray-600">
          มีบัญชีอยู่แล้ว? <a href="/login" className="text-blue-600 hover:underline">เข้าสู่ระบบ</a>
        </p>
      </form>
    </div>
  );
}