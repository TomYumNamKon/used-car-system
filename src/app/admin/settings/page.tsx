'use client'

import { useState, useEffect, FormEvent } from 'react';

export default function SystemSettingsPage() {
  const [marginPercent, setMarginPercent] = useState<number>(0);
  const [isFetching, setIsFetching] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);

  const mockRealPrice: number = 500000; 

  const getPreviewPrice = (): number => {
    const discount = mockRealPrice * (marginPercent / 100);
    return mockRealPrice - discount;
  };

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await fetch('/api/admin/settings');
        if (response.ok) {
          const data = await response.json();
          if (data.marginRate !== undefined) {
            setMarginPercent(data.marginRate * 100);
          }
        }
      } catch (error) {
        console.error("Error fetching settings:", error);
      } finally {
        setIsFetching(false);
      }
    };
    
    fetchSettings();
  }, []);

  const handleSave = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSaving(true);
    
    try {
      const marginRateToSend = marginPercent / 100;

      const response = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ marginRate: marginRateToSend }), 
      });

      if (response.ok) {
        alert(`บันทึกการตั้งค่าสำเร็จ: ระบบจะหัก ${marginPercent}% จากราคาประเมินจริง`);
      } else {
        const errorData = await response.json();
        alert(`เกิดข้อผิดพลาด: ${errorData.error || 'ไม่สามารถบันทึกได้'}`);
      }
    } catch (error) {
      alert("เกิดข้อผิดพลาดในการเชื่อมต่อกับเซิร์ฟเวอร์");
      console.error("Save error:", error);
    } finally {
      setIsSaving(false);
    }
  };

  if (isFetching) {
    return (
      <div className="flex justify-center items-center h-[50vh] w-full relative z-10">
        <div className="flex flex-col items-center gap-3">
          <svg className="animate-spin h-8 w-8 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
          <p className="text-slate-400 font-bold text-base animate-pulse">กำลังโหลด...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 max-w-xl mx-auto font-sans relative z-10">
      
      {/* Header - เล็กลง */}
      <div className="mb-6 text-center md:text-left">
        <h1 className="text-2xl font-black text-slate-800 tracking-tight">ตั้งค่าระบบ</h1>
        <p className="text-slate-500 text-xs mt-1 font-medium">จัดการเปอร์เซ็นต์ส่วนต่างกำไรการเสนอซื้อ</p>
      </div>

      {/* Main Container - กระชับขึ้น */}
      <div className="bg-white/80 backdrop-blur-xl border border-slate-200 rounded-[1.5rem] shadow-xl shadow-slate-200/30 p-6">
        
        <form onSubmit={handleSave} className="space-y-6">
          
          {/* Input Section */}
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">
              หักส่วนต่างจากราคาประเมินจริง (%)
            </label>
            <div className="relative">
              <input
                type="number"
                min="0"
                max="100"
                step="0.1"
                value={marginPercent}
                onChange={(e) => setMarginPercent(Number(e.target.value))}
                className="w-full bg-slate-50/50 border border-slate-200 px-5 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-blue-600 font-black text-2xl transition-all shadow-inner"
                required
                disabled={isSaving}
              />
              <span className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-300 font-black text-xl">%</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-3 leading-relaxed px-1">
              * ราคานี้จะถูกหักออกจากราคา AI ก่อนแสดงเป็นราคาเสนอซื้อให้ลูกค้า
            </p>
          </div>

          {/* Preview Section - ขนาดพอดีคำ */}
          <div className="p-5 bg-slate-50 border border-slate-100 rounded-2xl relative overflow-hidden">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-1.5">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
              ตัวอย่างการแสดงผล
            </h3>
            
            <div className="space-y-2.5 text-sm">
              <div className="flex justify-between items-center text-slate-500">
                <span>ราคากลาง (100%):</span>
                <span className="font-semibold">£{mockRealPrice.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center text-red-400 border-b border-slate-200 pb-2.5">
                <span>หักส่วนต่าง ({marginPercent}%):</span>
                <span className="font-semibold">- £{(mockRealPrice * (marginPercent / 100)).toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center pt-1.5">
                <span className="font-bold text-slate-700">ราคาที่ลูกค้าเห็น:</span>
                <span className="font-black text-emerald-500 text-xl tracking-tight">£{getPreviewPrice().toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSaving}
            className={`w-full py-3.5 text-white font-bold rounded-xl shadow-lg transition-all duration-300 active:scale-95 flex items-center justify-center text-sm
            ${isSaving 
              ? 'bg-slate-300 shadow-none cursor-not-allowed' 
              : 'bg-gradient-to-r from-blue-600 to-indigo-600 shadow-blue-100 hover:shadow-xl hover:-translate-y-0.5'
            }`}
          >
            {isSaving ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-slate-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                กำลังบันทึก...
              </>
            ) : (
              'บันทึกการตั้งค่า'
            )}
          </button>

        </form>
      </div>
    </div>
  );
}