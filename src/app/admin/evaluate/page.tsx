'use client';
import { useState, useEffect } from 'react';

export default function AdminEvaluatePage() {
  // --- 1. State สำหรับเก็บตัวเลือกที่ดึงจาก API ---
  const [brands, setBrands] = useState<string[]>([]);
  const [models, setModels] = useState<string[]>([]);
  const [transmissions, setTransmissions] = useState<string[]>([]);
  const [fuels, setFuels] = useState<string[]>([]);

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

  // --- 2. ดึงข้อมูล Features (ยี่ห้อ, เกียร์, เชื้อเพลิง) ตอนเปิดหน้าเว็บ ---
  useEffect(() => {
    const fetchFeatures = async () => {
      try {
        const res = await fetch('/api/ml/features'); // เรียกไปที่ API
        if (res.ok) {
          const data = await res.json();
          // ปรับโครงสร้าง data ให้ตรงกับที่ API ของคุณส่งมา
          setBrands(data.brands || []);
          setTransmissions(data.transmissions || []);
          setFuels(data.fuelTypes || data.fuels || []);
        }
      } catch (error) {
        console.error("Error fetching features:", error);
      }
    };
    fetchFeatures();
  }, []);

  // --- 3. ดึงข้อมูล Models เมื่อมีการเลือก/เปลี่ยนยี่ห้อ (Brand) ---
  useEffect(() => {
    const fetchModelsByBrand = async () => {
      if (!formData.brand) {
        setModels([]); // ถ้ายังไม่เลือกยี่ห้อ ให้ล้างรุ่นทิ้ง
        return;
      }
      try {
        const res = await fetch(`/api/ml/models/${formData.brand}`);
        if (res.ok) {
          const data = await res.json();
          setModels(data.models || data || []);
        }
      } catch (error) {
        console.error("Error fetching models:", error);
      }
    };
    fetchModelsByBrand();
  }, [formData.brand]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    // ถ้าเปลี่ยนยี่ห้อ ให้เคลียร์ช่องรุ่นทิ้ง เพื่อรอโหลดรุ่นใหม่
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
          phone: formData.phone || "000-000-0000",
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
      <div className="mb-6 border-b pb-4">
        <h1 className="text-2xl font-bold text-gray-800">แบบฟอร์มประเมินราคารถ</h1>
        <p className="text-gray-500 text-sm mt-1">ประเมินราคา (แสดงทั้งราคากลางและราคาเสนอซื้อ)</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* ฟอร์มกรอกข้อมูล */}
        <div className="w-full lg:w-2/3 bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h2 className="text-lg font-bold text-blue-700 mb-4 flex items-center">
            ระบุสเปครถยนต์
          </h2>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">ยี่ห้อ (Brand)</label>
                <select name="brand" required value={formData.brand} onChange={handleChange} className="w-full border p-2 rounded-md focus:ring-2 focus:ring-blue-500 outline-none bg-white text-gray-900">
                  <option value="" disabled>เลือกยี่ห้อ</option>
                  {brands.map(b => <option key={b} value={b}>{b}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">รุ่น (Model)</label>
                <select name="model" required value={formData.model} onChange={handleChange} disabled={!formData.brand || models.length === 0} className="w-full border p-2 rounded-md focus:ring-2 focus:ring-blue-500 outline-none bg-white disabled:bg-gray-100 text-gray-900">
                  <option value="" disabled>
                    {!formData.brand ? 'กรุณาเลือกยี่ห้อก่อน' : (models.length === 0 ? 'กำลังโหลดรุ่น...' : 'เลือกรุ่น')}
                  </option>
                  {models.map((m: string) => <option key={m} value={m}>{m}</option>)}
                </select>
              </div>
            </div>

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

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">เกียร์</label>
                <select name="transmission" required value={formData.transmission} className="w-full p-2 border rounded-md text-gray-900 focus:ring-2 focus:ring-blue-500 outline-none bg-white" onChange={handleChange}>
                  <option value="" disabled>เลือกเกียร์</option>
                  {transmissions.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">เชื้อเพลิง</label>
                <select name="fuelType" required value={formData.fuelType} className="w-full p-2 border rounded-md text-gray-900 focus:ring-2 focus:ring-blue-500 outline-none bg-white" onChange={handleChange}>
                  <option value="" disabled>เลือกเชื้อเพลิง</option>
                  {fuels.map(f => <option key={f} value={f}>{f}</option>)}
                </select>
              </div>
            </div>

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
              {isLoading ? 'กำลังวิเคราะห์ด้วย AI...' : 'ประเมินราคา'}
            </button>
          </form>

          {errorMsg && (
            <div className="mt-4 p-3 bg-red-100 text-red-700 rounded-md text-center text-sm border border-red-200">
              {errorMsg}
            </div>
          )}
        </div>

        {/* แสดงผลการประเมินราคา */}
        <div className="w-full lg:w-1/3 space-y-4">
          <div className={`p-6 rounded-xl border ${aiPrice !== null ? 'bg-blue-50 border-blue-200 shadow-md' : 'bg-gray-50 border-gray-200'}`}>
            <h2 className="text-sm text-blue-800 font-semibold mb-2">ราคากลางประเมิน</h2>
            {aiPrice !== null ? (
              <div>
                <p className="text-4xl font-bold text-blue-700 mb-2">£{aiPrice.toLocaleString()}</p>
                <p className="text-xs text-gray-500">* นี่คือราคาต้นทุน 100% จาก ML Model</p>
              </div>
            ) : <p className="text-gray-400 text-sm italic">รอผลการประเมิน...</p>}
          </div>

          <div className={`p-6 rounded-xl border ${resultPrice !== null ? 'bg-green-50 border-green-200 shadow-md' : 'bg-gray-50 border-gray-200'}`}>
            <h2 className="text-sm text-green-800 font-semibold mb-2">ราคาเสนอซื้อให้ลูกค้า</h2>
            {resultPrice !== null ? (
              <div>
                <p className="text-4xl font-bold text-green-600 mb-2">£{resultPrice.toLocaleString()}</p>
                <p className="text-xs text-green-700">* หักเปอร์เซ็นต์ส่วนต่างตามที่ตั้งค่าไว้ในระบบแล้ว</p>
              </div>
            ) : <p className="text-gray-400 text-sm italic">รอผลการประเมิน...</p>}
          </div>
        </div>
      </div>
    </div>
  );
}