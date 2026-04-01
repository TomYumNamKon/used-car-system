"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AuthPage() {
  const router = useRouter();
  const [isRightPanelActive, setIsRightPanelActive] = useState(false);
  const [error, setError] = useState("");

  // States สำหรับ Login (เปลี่ยนจาก Email เป็น Username)
  const [loginUsername, setLoginUsername] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  // States สำหรับ Register (สมัครเป็นผู้ขาย)
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
      // ส่ง username และ password ไปที่ API Login
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: loginUsername, password: loginPassword }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Login failed");
      }

      // ✅ จุดที่แก้ไข: บันทึกข้อมูล user ลง Local Storage เพื่อให้หน้า Evaluate ดึงไปใช้ได้
      localStorage.setItem("user", JSON.stringify(data.user));

      // ตรวจสอบ Role เพื่อ redirect
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
        setIsRightPanelActive(false); // สไลด์กลับหน้า Login
        setLoginUsername(regForm.username); // ใส่ชื่อรอไว้ให้เลย
      } else {
        throw new Error(data.error || "เกิดข้อผิดพลาด");
      }
    } catch (err: any) {
      setError(err.message);
      alert(err.message);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 font-sans p-4">
      <div className={`relative w-[768px] max-w-full min-h-[520px] bg-white rounded-2xl shadow-2xl overflow-hidden`}>
        
        {/* --- ฝั่ง สมัครสมาชิก (Register) --- */}
        <div
          className={`absolute top-0 left-0 w-1/2 h-full transition-all duration-700 ease-in-out flex flex-col items-center justify-center px-8 bg-white text-center ${
            isRightPanelActive
              ? "translate-x-full opacity-100 z-50"
              : "opacity-0 z-10"
          }`}
        >
          <form onSubmit={handleRegister} className="w-full flex flex-col items-center">
            <h1 className="text-2xl font-bold mb-4 text-gray-800">สมัครเป็นผู้ขาย (Seller)</h1>
            <div className="w-full space-y-3">
              <input
                type="text"
                placeholder="ชื่อผู้ใช้งาน (Username)"
                className="w-full bg-gray-100 border-none px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 text-black"
                value={regForm.username} 
                onChange={(e) => setRegForm({...regForm, username: e.target.value})}
                required
              />
              <input
                type="text"
                placeholder="เบอร์โทรศัพท์"
                className="w-full bg-gray-100 border-none px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 text-black"
                value={regForm.phone} 
                onChange={(e) => setRegForm({...regForm, phone: e.target.value})}
                required
              />
              <input
                type="password"
                placeholder="รหัสผ่าน"
                className="w-full bg-gray-100 border-none px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 text-black"
                value={regForm.password} 
                onChange={(e) => setRegForm({...regForm, password: e.target.value})}
                required
              />
              <input
                type="password"
                placeholder="ยืนยันรหัสผ่าน"
                className="w-full bg-gray-100 border-none px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 text-black"
                value={regForm.confirmPassword} 
                onChange={(e) => setRegForm({...regForm, confirmPassword: e.target.value})}
                required
              />
            </div>
            <button type="submit" className="w-full mt-6 rounded-full bg-blue-600 text-white text-xs font-bold px-12 py-3 tracking-wider uppercase transition-all hover:bg-blue-700 active:scale-95">
              สมัครสมาชิก
            </button>
          </form>
        </div>

        {/* --- ฝั่ง เข้าสู่ระบบ (Login) --- */}
        <div
          className={`absolute top-0 left-0 w-1/2 h-full transition-all duration-700 ease-in-out flex flex-col items-center justify-center px-8 bg-white text-center z-20 ${
            isRightPanelActive ? "translate-x-full opacity-0" : "opacity-100"
          }`}
        >
          <form onSubmit={handleLogin} className="w-full flex flex-col items-center">
            <h1 className="text-3xl font-bold mb-4 text-gray-800">เข้าสู่ระบบ</h1>
            <span className="text-sm text-gray-500 mb-6">กรอกชื่อผู้ใช้งานเพื่อเข้าสู่ระบบ</span>
            <input
              type="text"
              placeholder="Username"
              className="w-full bg-gray-100 border-none px-4 py-3 mb-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 text-black"
              value={loginUsername} 
              onChange={(e) => setLoginUsername(e.target.value)}
              required
            />
            <input
              type="password"
              placeholder="Password"
              className="w-full bg-gray-100 border-none px-4 py-3 mb-6 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 text-black"
              value={loginPassword} 
              onChange={(e) => setLoginPassword(e.target.value)}
              required
            />
            {error && !isRightPanelActive && <p className="text-red-500 text-sm mb-4">{error}</p>}
            <button type="submit" className="w-full rounded-full bg-blue-600 text-white text-xs font-bold px-12 py-3 tracking-wider uppercase transition-all hover:bg-blue-700 active:scale-95">
              เข้าสู่ระบบ
            </button>
          </form>
        </div>

        {/* --- ฝั่ง Overlay (ปุ่มสไลด์สีฟ้า) --- */}
        <div
          className={`absolute top-0 left-1/2 w-1/2 h-full overflow-hidden transition-transform duration-700 ease-in-out z-[100] ${
            isRightPanelActive ? "-translate-x-full" : ""
          }`}
        >
          <div
            className={`bg-gradient-to-r from-blue-500 to-indigo-600 relative -left-full h-full w-[200%] transition-transform duration-700 ease-in-out text-white ${
              isRightPanelActive ? "translate-x-1/2" : "translate-x-0"
            }`}
          >
            <div
              className={`absolute top-0 flex flex-col items-center justify-center w-1/2 h-full px-10 text-center transition-transform duration-700 ease-in-out ${
                isRightPanelActive ? "translate-x-0" : "-translate-x-[20%]"
              }`}
            >
              <h1 className="text-3xl font-bold mb-4">มีบัญชีอยู่แล้ว?</h1>
              <p className="text-sm font-light leading-relaxed mb-8">
                หากคุณเคยสมัครสมาชิกไว้แล้ว สามารถเข้าสู่ระบบเพื่อใช้งานต่อได้เลย
              </p>
              <button
                type="button"
                onClick={() => { setIsRightPanelActive(false); setError(""); }}
                className="rounded-full border border-white bg-transparent text-white text-xs font-bold px-12 py-3 tracking-wider uppercase transition-transform active:scale-95"
              >
                ไปหน้าเข้าสู่ระบบ
              </button>
            </div>

            <div
              className={`absolute top-0 right-0 flex flex-col items-center justify-center w-1/2 h-full px-10 text-center transition-transform duration-700 ease-in-out ${
                isRightPanelActive ? "translate-x-[20%]" : "translate-x-0"
              }`}
            >
              <h1 className="text-3xl font-bold mb-4">สวัสดีเพื่อนใหม่!</h1>
              <p className="text-sm font-light leading-relaxed mb-8">
                ต้องการขายรถกับเรา? สมัครสมาชิกเพื่อเริ่มต้นลงประกาศขายได้ทันที
              </p>
              <button
                type="button"
                onClick={() => { setIsRightPanelActive(true); setError(""); }}
                className="rounded-full border border-white bg-transparent text-white text-xs font-bold px-12 py-3 tracking-wider uppercase transition-transform active:scale-95"
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