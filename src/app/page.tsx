'use client';
import Link from 'next/link';
import { motion } from 'framer-motion';

export default function HomePage() {
  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden bg-slate-50 font-sans">
      
      {/* --- ของตกแต่งพื้นหลัง (Glowing Blobs) --- */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-blue-300 rounded-full mix-blend-multiply filter blur-[100px] opacity-60"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-indigo-300 rounded-full mix-blend-multiply filter blur-[100px] opacity-60"></div>
      <div className="absolute top-[20%] right-[10%] w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-[100px] opacity-50"></div>

      {/* --- เนื้อหาหลัก --- */}
      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="relative z-10 w-full max-w-5xl px-6 text-center space-y-10"
      >
        
        {/* ข้อความนำ */}
        <div className="space-y-6">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="inline-flex items-center gap-3 px-5 py-2.5 rounded-full bg-blue-50/80 backdrop-blur-sm border border-blue-100 text-blue-600 text-sm font-bold tracking-widest uppercase shadow-sm"
          >
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-600"></span>
            </span>
            Powered by AI Machine Learning
          </motion.div>
          
          <h1 className="text-5xl md:text-7xl font-black text-slate-900 tracking-tight leading-tight drop-shadow-sm">
            ระบบประเมินราคา <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600">
              รถยนต์มือสอง
            </span>
          </h1>
          
          <p className="text-lg md:text-xl text-slate-600 leading-relaxed max-w-2xl mx-auto font-medium">
            ยกระดับการตีราคารถยนต์ด้วยระบบ AI อัจฉริยะ วิเคราะห์จากฐานข้อมูลตลาดจริง เพื่อให้ได้ราคากลางที่แม่นยำและยุติธรรมที่สุด
          </p>
        </div>

        {/* ปุ่มเข้าสู่ระบบ */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-6"
        >
          <Link 
            href="/login" 
            className="group relative flex items-center justify-center gap-3 px-10 py-5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold rounded-2xl shadow-xl shadow-blue-200 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 w-full sm:w-auto text-lg overflow-hidden"
          >
            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-in-out"></div>
            <span className="relative">เข้าสู่ระบบ (พนักงาน)</span>
            <svg className="w-6 h-6 relative group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </Link>
        </motion.div>
        
        {/* กราฟิกตกแต่งด้านล่าง (Mockup หน้าต่างโปรแกรมแบบโปร่งแสง) */}
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.8 }}
          className="pt-16 hidden md:block"
        >
          <div className="mx-auto max-w-4xl h-48 bg-white/40 backdrop-blur-xl border border-white/60 rounded-t-[2.5rem] shadow-2xl overflow-hidden relative">
            <div className="w-full h-12 bg-white/60 border-b border-white/50 flex items-center px-6 gap-2">
              <div className="w-3 h-3 rounded-full bg-red-400"></div>
              <div className="w-3 h-3 rounded-full bg-amber-400"></div>
              <div className="w-3 h-3 rounded-full bg-green-400"></div>
            </div>
            <div className="p-8 flex gap-8 opacity-40">
              <div className="w-1/3 h-24 bg-gradient-to-br from-blue-100 to-indigo-50 rounded-2xl"></div>
              <div className="w-2/3 space-y-4 pt-2">
                <div className="w-full h-4 bg-slate-200 rounded-full"></div>
                <div className="w-5/6 h-4 bg-slate-200 rounded-full"></div>
                <div className="w-4/6 h-4 bg-slate-200 rounded-full"></div>
              </div>
            </div>
            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-slate-50"></div>
          </div>
        </motion.div>

      </motion.div>

      {/* Footer */}
      <div className="absolute bottom-8 text-center text-sm text-slate-400 font-medium z-20">
        <p>© 2026 Used Car Valuation System. All rights reserved.</p>
      </div>
    </div>
  );
}