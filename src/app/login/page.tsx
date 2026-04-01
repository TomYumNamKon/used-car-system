"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AuthPage() {
  const router = useRouter();
  const [isRightPanelActive, setIsRightPanelActive] = useState(false);
  const [error, setError] = useState("");

  const [loginUsername, setLoginUsername] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  const [regForm, setRegForm] = useState({ 
    username: '', 
    phone: '', 
    password: '', 
    confirmPassword: '' 
  });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: loginUsername, password: loginPassword }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Login failed");
      }

      localStorage.setItem("user", JSON.stringify(data.user));

      if (data.user.role === "ADMIN") {
        router.push("/admin/sales");
      } else {
        router.push("/evaluate");
      }
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (regForm.password !== regForm.confirmPassword) {
      return alert("รหัสผ่านไม่ตรงกัน");
    }

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          username: regForm.username, 
          phone: regForm.phone, 
          password: regForm.password 
        }),
      });

      const data = await res.json();

      if (res.ok) {
        alert("สมัครสมาชิกสำเร็จ!");
        setIsRightPanelActive(false); 
        setLoginUsername(regForm.username); 
      } else {
        throw new Error(data.error || "เกิดข้อผิดพลาด");
      }
    } catch (err: any) {
      setError(err.message);
      alert(err.message);
    }
  };

  return (
    <div className="relative flex items-center justify-center min-h-screen bg-slate-50 font-sans p-4 overflow-hidden">
      
      {/* --- ของตกแต่งพื้นหลังแบบหน้า Home --- */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-blue-300 rounded-full mix-blend-multiply filter blur-[100px] opacity-60"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-indigo-300 rounded-full mix-blend-multiply filter blur-[100px] opacity-60"></div>
      <div className="absolute top-[20%] right-[10%] w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-[100px] opacity-50"></div>

      <div className={`relative z-10 w-[768px] max-w-full min-h-[520px] bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/50 overflow-hidden`}>
        
        {/* --- ฝั่ง สมัครสมาชิก (Register) --- */}
        <div
          className={`absolute top-0 left-0 w-1/2 h-full transition-all duration-700 ease-in-out flex flex-col items-center justify-center px-8 text-center ${
            isRightPanelActive
              ? "translate-x-full opacity-100 z-50"
              : "opacity-0 z-10"
          }`}
        >
          <form onSubmit={handleRegister} className="w-full flex flex-col items-center">
            <h1 className="text-2xl font-bold mb-4 text-slate-800">สมัครเป็นผู้ขาย (Seller)</h1>
            <div className="w-full space-y-3">
              <input
                type="text"
                placeholder="ชื่อผู้ใช้งาน (Username)"
                className="w-full bg-slate-100/50 border border-slate-200 px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800 transition-all"
                value={regForm.username} 
                onChange={(e) => setRegForm({...regForm, username: e.target.value})}
                required
              />
              <input
                type="text"
                placeholder="เบอร์โทรศัพท์"
                className="w-full bg-slate-100/50 border border-slate-200 px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800 transition-all"
                value={regForm.phone} 
                onChange={(e) => setRegForm({...regForm, phone: e.target.value})}
                required
              />
              <input
                type="password"
                placeholder="รหัสผ่าน"
                className="w-full bg-slate-100/50 border border-slate-200 px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800 transition-all"
                value={regForm.password} 
                onChange={(e) => setRegForm({...regForm, password: e.target.value})}
                required
              />
              <input
                type="password"
                placeholder="ยืนยันรหัสผ่าน"
                className="w-full bg-slate-100/50 border border-slate-200 px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800 transition-all"
                value={regForm.confirmPassword} 
                onChange={(e) => setRegForm({...regForm, confirmPassword: e.target.value})}
                required
              />
            </div>
            <button type="submit" className="w-full mt-6 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-sm font-bold px-12 py-3.5 tracking-wider uppercase transition-transform hover:-translate-y-0.5 shadow-lg shadow-blue-200 active:scale-95">
              สมัครสมาชิก
            </button>
          </form>
        </div>

        {/* --- ฝั่ง เข้าสู่ระบบ (Login) --- */}
        <div
          className={`absolute top-0 left-0 w-1/2 h-full transition-all duration-700 ease-in-out flex flex-col items-center justify-center px-8 text-center z-20 ${
            isRightPanelActive ? "translate-x-full opacity-0" : "opacity-100"
          }`}
        >
          <form onSubmit={handleLogin} className="w-full flex flex-col items-center">
            <h1 className="text-3xl font-black mb-2 text-slate-800">เข้าสู่ระบบ</h1>
            <span className="text-sm text-slate-500 mb-8 font-medium">กรอกข้อมูลเพื่อเข้าใช้งานระบบ</span>
            <input
              type="text"
              placeholder="Username"
              className="w-full bg-slate-100/50 border border-slate-200 px-4 py-3 mb-4 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800 transition-all"
              value={loginUsername} 
              onChange={(e) => setLoginUsername(e.target.value)}
              required
            />
            <input
              type="password"
              placeholder="Password"
              className="w-full bg-slate-100/50 border border-slate-200 px-4 py-3 mb-6 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800 transition-all"
              value={loginPassword} 
              onChange={(e) => setLoginPassword(e.target.value)}
              required
            />
            {error && !isRightPanelActive && <p className="text-red-500 text-sm mb-4 font-medium px-4 py-2 bg-red-50 rounded-lg">{error}</p>}
            <button type="submit" className="w-full rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-sm font-bold px-12 py-3.5 tracking-wider uppercase transition-transform hover:-translate-y-0.5 shadow-lg shadow-blue-200 active:scale-95">
              เข้าสู่ระบบ
            </button>
          </form>
        </div>

        {/* --- ฝั่ง Overlay (ปุ่มสไลด์) --- */}
        <div
          className={`absolute top-0 left-1/2 w-1/2 h-full overflow-hidden transition-transform duration-700 ease-in-out z-[100] ${
            isRightPanelActive ? "-translate-x-full" : ""
          }`}
        >
          <div
            className={`bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 relative -left-full h-full w-[200%] transition-transform duration-700 ease-in-out text-white ${
              isRightPanelActive ? "translate-x-1/2" : "translate-x-0"
            }`}
          >
            {/* ตกแต่งด้านใน Overlay นิดหน่อย */}
            <div className="absolute inset-0 bg-white/10 mix-blend-overlay"></div>
            
            <div
              className={`absolute top-0 flex flex-col items-center justify-center w-1/2 h-full px-10 text-center transition-transform duration-700 ease-in-out ${
                isRightPanelActive ? "translate-x-0" : "-translate-x-[20%]"
              }`}
            >
              <h1 className="text-3xl font-bold mb-4 drop-shadow-sm">มีบัญชีอยู่แล้ว?</h1>
              <p className="text-sm font-medium leading-relaxed mb-8 opacity-90">
                หากคุณเคยสมัครสมาชิกไว้แล้ว สามารถเข้าสู่ระบบเพื่อใช้งานต่อได้เลย
              </p>
              <button
                type="button"
                onClick={() => { setIsRightPanelActive(false); setError(""); }}
                className="rounded-xl border-2 border-white/80 hover:bg-white hover:text-indigo-600 text-white text-sm font-bold px-10 py-3 tracking-wider uppercase transition-all active:scale-95 shadow-md"
              >
                ไปหน้าเข้าสู่ระบบ
              </button>
            </div>

            <div
              className={`absolute top-0 right-0 flex flex-col items-center justify-center w-1/2 h-full px-10 text-center transition-transform duration-700 ease-in-out ${
                isRightPanelActive ? "translate-x-[20%]" : "translate-x-0"
              }`}
            >
              <h1 className="text-3xl font-bold mb-4 drop-shadow-sm">สวัสดีเพื่อนใหม่!</h1>
              <p className="text-sm font-medium leading-relaxed mb-8 opacity-90">
                ต้องการตีราคารถยนต์กับเรา? สมัครสมาชิกเพื่อเริ่มต้นใช้งานระบบประเมินของเราได้เลย
              </p>
              <button
                type="button"
                onClick={() => { setIsRightPanelActive(true); setError(""); }}
                className="rounded-xl border-2 border-white/80 hover:bg-white hover:text-indigo-600 text-white text-sm font-bold px-10 py-3 tracking-wider uppercase transition-all active:scale-95 shadow-md"
              >
                สมัครเป็นผู้ขาย
              </button>
            </div>
          </div>
        </div>
        
      </div>
    </div>
  );
}