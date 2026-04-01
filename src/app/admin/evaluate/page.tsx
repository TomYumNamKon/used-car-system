'use client';
import { useState } from 'react';

const carDataOptions = {
  brands: ["Toyota", "Honda", "BMW", "Audi"],
  models: {
    "Toyota": ["Camry", "Corolla", "Vios", "Yaris"],
    "Honda": ["Civic", "Accord", "City", "HR-V"],
    "BMW": ["Series 3", "Series 5", "X3", "X5"],
    "Audi": ["A4", "A6", "Q5", "TT"]
  },
  transmissions: ["Automatic", "Manual", "Semi-Auto"],
  fuels: ["Petrol", "Diesel", "Hybrid", "Electric"]
};

export default function AdminEvaluatePage() {
  const [formData, setFormData] = useState({
    brand: '',
    model: '',
    year: '',
    transmission: '',
    mileage: '',
    fuelType: '',
    tax: '',        
    mpg: '',        
    engineSize: '', 
    phone: ''
  });

  const [resultPrice, setResultPrice] = useState<number | null>(null);
  const [aiPrice, setAiPrice] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    // ถ้าเปลี่ยนยี่ห้อ ให้เคลียร์ช่องรุ่นทิ้ง
    if (name === 'brand') {
      setFormData({ ...formData, brand: value, model: '' });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg('');
    setResultPrice(null);
    setAiPrice(null); 

    const userDataStr = localStorage.getItem('user');
    if (!userDataStr) {
      setErrorMsg('กรุณาเข้าสู่ระบบในฐานะ Admin ก่อนใช้งานครับ!');
      setIsLoading(false);
      return; 
    }
    const userData = JSON.parse(userDataStr);

    try {
      const response = await fetch('/api/valuation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: userData.userId, 
          phone: formData.phone || "000-000-0000", // ถ้า Admin ไม่กรอกเบอร์ ให้ใส่ค่า Default
          carSpecs: {
            brand: formData.brand,
            model: formData.model,
            transmission: formData.transmission,
            fuelType: formData.fuelType,
            year: Number(formData.year),
            mileage: Number(formData.mileage),
            tax: Number(formData.tax),
            mpg: Number(formData.mpg),
            engineSize: Number(formData.engineSize),
          }
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'เกิดข้อผิดพลาดในการประเมินราคา');
      }

      setResultPrice(data.displayedPrice ?? data.offered_price ?? 0);
      
      if (data.aiPrice) {
        setAiPrice(data.aiPrice);
      }

    } catch (error: any) {
      setErrorMsg(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-8">
      {/* ส่วนหัว */}
      <div className="mb-6 border-b pb-4">
        <h1 className="text-2xl font-bold text-gray-800">แบบฟอร์มประเมินราคารถ </h1>
        <p className="text-gray-500 text-sm mt-1">ประเมินราคา (แสดงทั้งราคากลางและราคาเสนอซื้อ)</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* คอลัมน์ซ้าย: ฟอร์มกรอกข้อมูล */}
        <div className="w-full lg:w-2/3 bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h2 className="text-lg font-bold text-blue-700 mb-4 flex items-center">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            ระบุสเปครถยนต์
          </h2>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* ยี่ห้อ & รุ่น */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">ยี่ห้อ (Brand)</label>
                <select name="brand" required value={formData.brand} onChange={handleChange} className="w-full border p-2 rounded-md focus:ring-2 focus:ring-blue-500 outline-none bg-white text-gray-900">
                  <option value="" disabled>เลือกยี่ห้อ</option>
                  {carDataOptions.brands.map(b => <option key={b} value={b}>{b}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">รุ่น (Model)</label>
                <select name="model" required value={formData.model} onChange={handleChange} disabled={!formData.brand} className="w-full border p-2 rounded-md focus:ring-2 focus:ring-blue-500 outline-none bg-white disabled:bg-gray-100 text-gray-900">
                  <option value="" disabled>{formData.brand ? 'เลือกรุ่น' : 'กรุณาเลือกยี่ห้อก่อน'}</option>
                  {formData.brand && (carDataOptions.models as any)[formData.brand]?.map((m: string) => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* ปี, ไมล์, เครื่องยนต์ */}
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">ปี (Year)</label>
                <input type="number" name="year" required value={formData.year} className="w-full p-2 border rounded-md text-gray-900 focus:ring-2 focus:ring-blue-500 outline-none" onChange={handleChange} placeholder="เช่น 2020" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">เลขไมล์ (Mileage)</label>
                <input type="number" name="mileage" required value={formData.mileage} className="w-full p-2 border rounded-md text-gray-900 focus:ring-2 focus:ring-blue-500 outline-none" onChange={handleChange} placeholder="เช่น 50000" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">เครื่องยนต์</label>
                <input type="number" step="0.1" name="engineSize" required value={formData.engineSize} className="w-full p-2 border rounded-md text-gray-900 focus:ring-2 focus:ring-blue-500 outline-none" onChange={handleChange} placeholder="เช่น 1.5" />
              </div>
            </div>

            {/* เกียร์ & เชื้อเพลิง */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">เกียร์</label>
                <select name="transmission" required value={formData.transmission} className="w-full p-2 border rounded-md text-gray-900 focus:ring-2 focus:ring-blue-500 outline-none bg-white" onChange={handleChange}>
                  <option value="" disabled>เลือกเกียร์</option>
                  {carDataOptions.transmissions.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">เชื้อเพลิง</label>
                <select name="fuelType" required value={formData.fuelType} className="w-full p-2 border rounded-md text-gray-900 focus:ring-2 focus:ring-blue-500 outline-none bg-white" onChange={handleChange}>
                  <option value="" disabled>เลือกเชื้อเพลิง</option>
                  {carDataOptions.fuels.map(f => <option key={f} value={f}>{f}</option>)}
                </select>
              </div>
            </div>

            {/* ภาษี & MPG */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">ภาษี (Tax)</label>
                <input type="number" name="tax" required value={formData.tax} className="w-full p-2 border rounded-md text-gray-900 focus:ring-2 focus:ring-blue-500 outline-none" onChange={handleChange} placeholder="145" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">อัตราสิ้นเปลือง (MPG)</label>
                <input type="number" step="0.1" name="mpg" required value={formData.mpg} className="w-full p-2 border rounded-md text-gray-900 focus:ring-2 focus:ring-blue-500 outline-none" onChange={handleChange} placeholder="55.4" />
              </div>
            </div>

            <button 
              type="submit" 
              disabled={isLoading}
              className="w-full mt-4 bg-blue-600 text-white font-bold py-3 px-4 rounded-md hover:bg-blue-700 shadow-md transition duration-200 disabled:bg-gray-400"
            >
              {isLoading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                  กำลังวิเคราะห์ด้วย AI...
                </span>
              ) : 'ประเมินราคา'}
            </button>
          </form>

          {errorMsg && (
            <div className="mt-4 p-3 bg-red-100 text-red-700 rounded-md text-center text-sm border border-red-200">
              {errorMsg}
            </div>
          )}
        </div>

        {/* คอลัมน์ขวา: แสดงผลการประเมินราคา */}
        <div className="w-full lg:w-1/3 space-y-4">
          
          {/* กล่องแสดงราคาประเมิน AI (ต้นทุน) */}
          <div className={`p-6 rounded-xl border ${aiPrice !== null ? 'bg-blue-50 border-blue-200 shadow-md' : 'bg-gray-50 border-gray-200'}`}>
            <h2 className="text-sm text-blue-800 font-semibold mb-2 flex items-center">
              <span className="mr-2 text-lg"></span> ราคากลางประเมิน
            </h2>
            {aiPrice !== null ? (
              <div>
                <p className="text-4xl font-bold text-blue-700 mb-2">
                  ฿{aiPrice.toLocaleString()}
                </p>
                <p className="text-xs text-gray-500">* นี่คือราคาต้นทุน 100% จาก ML Model</p>
              </div>
            ) : (
              <p className="text-gray-400 text-sm italic">รอผลการประเมิน...</p>
            )}
          </div>

          {/* กล่องแสดงราคาเสนอซื้อ (หัก Margin) */}
          <div className={`p-6 rounded-xl border ${resultPrice !== null ? 'bg-green-50 border-green-200 shadow-md' : 'bg-gray-50 border-gray-200'}`}>
            <h2 className="text-sm text-green-800 font-semibold mb-2 flex items-center">
              <span className="mr-2 text-lg"></span> ราคาเสนอซื้อให้ลูกค้า
            </h2>
            {resultPrice !== null ? (
              <div>
                <p className="text-4xl font-bold text-green-600 mb-2">
                  ฿{resultPrice.toLocaleString()}
                </p>
                <p className="text-xs text-green-700">* หักเปอร์เซ็นต์ส่วนต่างตามที่ตั้งค่าไว้ในระบบแล้ว</p>
              </div>
            ) : (
              <p className="text-gray-400 text-sm italic">รอผลการประเมิน...</p>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}