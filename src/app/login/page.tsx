'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [form, setForm] = useState({ username: '', password: '' });
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(form),
    });
    const data = await res.json();
    if (res.ok) {
      // เก็บข้อมูลไว้ใน localStorage (เบื้องต้น)
      localStorage.setItem('user', JSON.stringify(data));
      if (data.role === 'ADMIN') router.push('/admin/users');
      else router.push('/');
    } else {
      alert(data.error);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <form onSubmit={handleLogin} className="bg-white p-8 rounded-lg shadow-md w-96">
        <h1 className="text-2xl font-bold mb-6 text-black">เข้าสู่ระบบ</h1>
        <input 
          type="text" placeholder="Username" required
          className="w-full p-2 mb-4 border rounded text-black"
          onChange={(e) => setForm({...form, username: e.target.value})}
        />
        <input 
          type="password" placeholder="Password" required
          className="w-full p-2 mb-6 border rounded text-black"
          onChange={(e) => setForm({...form, password: e.target.value})}
        />
        <button className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700">Login</button>
        <p className="mt-4 text-sm text-center text-gray-600">
          ยังไม่มีบัญชี? <a href="/register" className="text-blue-600">สมัครที่นี่</a>
        </p>
      </form>
    </div>
  );
}