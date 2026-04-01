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
      <div className="flex justify-center items-center h-64 w-full">
        <p className="text-gray-500 text-lg">กำลังโหลดการตั้งค่าระบบ...</p>
      </div>
    );
  }

  return (
    <div className="p-8 bg-white rounded-lg shadow-sm w-full max-w-4xl mx-auto mt-6">
      <h2 className="text-2xl font-bold mb-6 text-gray-800 border-b pb-4">ตั้งค่าระบบ (System Settings)</h2>
      
      <form onSubmit={handleSave} className="max-w-xl">
        <div className="mb-6">
          <label className="block text-gray-800 font-semibold mb-2">
            หักเปอร์เซ็นต์ส่วนต่างจากราคาประเมินจริง (%)
          </label>
          <div className="flex items-center">
            <input
              type="number"
              min="0"
              max="100"
              step="0.1"
              value={marginPercent}
              onChange={(e) => setMarginPercent(Number(e.target.value))}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
              required
              disabled={isSaving}
            />
            <span className="ml-3 text-gray-600 font-medium">%</span>
          </div>
          <p className="text-sm text-gray-500 mt-2">
            * ราคานี้จะถูกหักออกจากราคา AI (Actual Price) ก่อนนำไปแสดงเป็นราคาเสนอซื้อ (Offered Price) ให้กับผู้ขายรถ (Seller)
          </p>
        </div>

        <div className="mb-8 p-5 bg-blue-50 border border-blue-200 rounded-lg shadow-sm">
          <h3 className="font-semibold text-blue-800 mb-3 flex items-center">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
            ตัวอย่างการแสดงผล (Preview)
          </h3>
          <div className="space-y-2">
            <div className="flex justify-between items-center text-gray-700">
              <span>ราคากลางที่ AI ประเมินได้ (100%):</span>
              <span className="font-medium">{mockRealPrice.toLocaleString()} ปอนด์</span>
            </div>
            <div className="flex justify-between items-center text-red-600 border-b border-blue-200 pb-2">
              <span>หักส่วนต่าง ({marginPercent}%):</span>
              <span>- {(mockRealPrice * (marginPercent / 100)).toLocaleString()} ปอนด์</span>
            </div>
            <div className="flex justify-between items-center text-lg mt-2 pt-1">
              <span className="font-bold text-gray-800">ผู้ขายรถ (Seller) จะเห็นราคา:</span>
              <span className="font-bold text-green-600">{getPreviewPrice().toLocaleString()} ปอนด์</span>
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={isSaving}
          className={`px-6 py-2.5 text-white font-semibold rounded-md shadow-sm transition-all duration-200 
            ${isSaving 
              ? 'bg-blue-400 cursor-not-allowed' 
              : 'bg-blue-600 hover:bg-blue-700 hover:shadow-md active:transform active:scale-95'
            }`}
        >
          {isSaving ? (
            <span className="flex items-center">
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
              กำลังบันทึก...
            </span>
          ) : (
            'บันทึกการตั้งค่า'
          )}
        </button>
      </form>
    </div>
  );
}