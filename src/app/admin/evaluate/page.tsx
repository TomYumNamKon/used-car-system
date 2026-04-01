'use client';
import { useState, useEffect } from 'react';

export default function AdminEvaluatePage() {
  // 1. State สำหรับ API
  const [brands, setBrands] = useState<string[]>([]);
  const [models, setModels] = useState<string[]>([]);
  const [transmissions, setTransmissions] = useState<string[]>([]);
  const [fuels, setFuels] = useState<string[]>([]);

  // 2. State สำหรับ Form
  const [formData, setFormData] = useState({
    brand: '', model: '', year: '', transmission: '',
    mileage: '', fuelType: '', tax: '', mpg: '', 
    engineSize: '', phone: ''
  });

  const [brandSearch, setBrandSearch] = useState('');
  const [modelSearch, setModelSearch] = useState('');
  const [showBrandList, setShowBrandList] = useState(false);
  const [showModelList, setShowModelList] = useState(false);
  
  const [resultPrice, setResultPrice] = useState<number | null>(null);
  const [aiPrice, setAiPrice] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // 3. ดึงข้อมูล Features ตอนเปิดเว็บ
  useEffect(() => {
    const fetchFeatures = async () => {
      try {
        const res = await fetch('/api/ml/features');
        
        // เช็คว่าเป็นการคืนค่า HTML (404) หรือไม่
        const contentType = res.headers.get("content-type");
        if (!res.ok || !contentType || !contentType.includes("application/json")) {
          throw new Error("หา API ไม่เจอ หรือเซิร์ฟเวอร์ Backend ยังไม่ได้รัน");
        }

        const data = await res.json();
        setBrands(data.brands || []);
        setTransmissions(data.transmissions || []);
        setFuels(data.fuelTypes || data.fuels || []);
      } catch (error: any) {
        setErrorMsg(error.message);
      }
    };
    fetchFeatures();
  }, []);

  // 4. เลือก Brand -> โหลด Model
  const handleBrandSelect = async (selectedBrand: string) => {
    setFormData({ ...formData, brand: selectedBrand, model: '' });
    setBrandSearch(selectedBrand);
    setModelSearch('');
    setShowBrandList(false);
    setIsLoading(true);

    try {
      const res = await fetch(`/api/ml/models/${selectedBrand}`);
      if (!res.ok) throw new Error("ไม่พบข้อมูลรุ่นรถ");
      const data = await res.json();
      setModels(data.models || []);
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleModelSelect = (selectedModel: string) => {
    setFormData({ ...formData, model: selectedModel });
    setModelSearch(selectedModel);
    setShowModelList(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg('');
    setResultPrice(null);
    setAiPrice(null); 

    const userDataStr = localStorage.getItem('user');
    // ดักจับ error กรณี localStorage เป็น "undefined" (บั๊กจากเวอร์ชันก่อน)
    if (!userDataStr || userDataStr === "undefined") {
      setErrorMsg('กรุณาเข้าสู่ระบบก่อนใช้งาน');
      setIsLoading(false);
      return;
    }

    try {
      const userData = JSON.parse(userDataStr);

      const response = await fetch('/api/valuation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: userData.id || userData.userId, // แก้ให้ตรงกับฐานข้อมูล
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
      if (!response.ok) throw new Error(data.error || 'ประเมินราคาไม่สำเร็จ');

      setResultPrice(data.displayedPrice ?? data.offered_price ?? 0);
      setAiPrice(data.aiPrice ?? null);
    } catch (error: any) {
      setErrorMsg(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  // ตัวกรองสำหรับการค้นหา (Autocomplete)
  const filteredBrands = brands.filter(b => b.toLowerCase().includes(brandSearch.toLowerCase()));
  const filteredModels = models.filter(m => m.toLowerCase().includes(modelSearch.toLowerCase()));

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <div className="mb-6 border-b pb-4">
        <h1 className="text-2xl font-bold text-gray-800">แบบฟอร์มประเมินราคารถ</h1>
        <p className="text-gray-500 text-sm mt-1">ประเมินราคาด้วย Machine Learning</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        
        {/* ฝั่งฟอร์ม (ซ้าย) */}
        <div className="w-full lg:w-2/3 bg-white p-8 rounded-xl shadow-sm border border-gray-200">
          <h2 className="text-lg font-bold text-blue-700 mb-6">ระบุสเปครถยนต์</h2>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* ยี่ห้อและรุ่น (ระบบพิมพ์ค้นหาได้) */}
            <div className="grid grid-cols-2 gap-4">
              <div className="relative">
                <label className="block text-sm font-medium text-gray-700 mb-1">ยี่ห้อ (Brand)</label>
                <input 
                  type="text"
                  placeholder="พิมพ์ค้นหายี่ห้อ..."
                  className="w-full border p-2.5 rounded-md focus:ring-2 focus:ring-blue-500 outline-none bg-white text-gray-900"
                  value={brandSearch}
                  onChange={(e) => { setBrandSearch(e.target.value); setShowBrandList(true); }}
                  onFocus={() => setShowBrandList(true)}
                  required
                />
                {showBrandList && brandSearch && (
                  <ul className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-48 overflow-y-auto">
                    {filteredBrands.map(b => (
                      <li key={b} onClick={() => handleBrandSelect(b)} className="p-2.5 hover:bg-blue-50 cursor-pointer border-b text-sm text-black">
                        {b}
                      </li>
                    ))}
                    {filteredBrands.length === 0 && <li className="p-2.5 text-sm text-gray-500">ไม่พบยี่ห้อนี้</li>}
                  </ul>
                )}
              </div>

              <div className="relative">
                <label className="block text-sm font-medium text-gray-700 mb-1">รุ่น (Model)</label>
                <input 
                  type="text"
                  placeholder={!formData.brand ? "เลือกยี่ห้อก่อน" : "พิมพ์ค้นหารุ่น..."}
                  className="w-full border p-2.5 rounded-md focus:ring-2 focus:ring-blue-500 outline-none bg-white text-gray-900 disabled:bg-gray-100"
                  value={modelSearch}
                  onChange={(e) => { setModelSearch(e.target.value); setShowModelList(true); }}
                  onFocus={() => setShowModelList(true)}
                  disabled={!formData.brand || models.length === 0}
                  required
                />
                {showModelList && modelSearch && (
                  <ul className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-48 overflow-y-auto">
                    {filteredModels.map(m => (
                      <li key={m} onClick={() => handleModelSelect(m)} className="p-2.5 hover:bg-blue-50 cursor-pointer border-b text-sm text-black">
                        {m}
                      </li>
                    ))}
                    {filteredModels.length === 0 && <li className="p-2.5 text-sm text-gray-500">ไม่พบรุ่นนี้</li>}
                  </ul>
                )}
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">ปี (Year)</label>
                <input type="number" name="year" required value={formData.year} className="w-full p-2.5 border rounded-md text-gray-900 focus:ring-2 focus:ring-blue-500 outline-none" onChange={(e) => setFormData({...formData, year: e.target.value})} placeholder="เช่น 2020" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">เลขไมล์ (Mileage)</label>
                <input type="number" name="mileage" required value={formData.mileage} className="w-full p-2.5 border rounded-md text-gray-900 focus:ring-2 focus:ring-blue-500 outline-none" onChange={(e) => setFormData({...formData, mileage: e.target.value})} placeholder="เช่น 50000" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">เครื่องยนต์</label>
                <input type="number" step="0.1" name="engineSize" required value={formData.engineSize} className="w-full p-2.5 border rounded-md text-gray-900 focus:ring-2 focus:ring-blue-500 outline-none" onChange={(e) => setFormData({...formData, engineSize: e.target.value})} placeholder="เช่น 1.5" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">เกียร์</label>
                <select name="transmission" required value={formData.transmission} className="w-full p-2.5 border rounded-md text-gray-900 focus:ring-2 focus:ring-blue-500 outline-none bg-white" onChange={(e) => setFormData({...formData, transmission: e.target.value})}>
                  <option value="" disabled>เลือกเกียร์</option>
                  {transmissions.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">เชื้อเพลิง</label>
                <select name="fuelType" required value={formData.fuelType} className="w-full p-2.5 border rounded-md text-gray-900 focus:ring-2 focus:ring-blue-500 outline-none bg-white" onChange={(e) => setFormData({...formData, fuelType: e.target.value})}>
                  <option value="" disabled>เลือกเชื้อเพลิง</option>
                  {fuels.map(f => <option key={f} value={f}>{f}</option>)}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">ภาษี (Tax)</label>
                <input type="number" name="tax" required value={formData.tax} className="w-full p-2.5 border rounded-md text-gray-900 focus:ring-2 focus:ring-blue-500 outline-none" onChange={(e) => setFormData({...formData, tax: e.target.value})} placeholder="145" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">อัตราสิ้นเปลือง (MPG)</label>
                <input type="number" step="0.1" name="mpg" required value={formData.mpg} className="w-full p-2.5 border rounded-md text-gray-900 focus:ring-2 focus:ring-blue-500 outline-none" onChange={(e) => setFormData({...formData, mpg: e.target.value})} placeholder="55.4" />
              </div>
            </div>

            <button 
              type="submit" 
              disabled={isLoading}
              className="w-full mt-4 bg-blue-600 text-white font-bold py-3 px-4 rounded-md hover:bg-blue-700 shadow-md transition duration-200 disabled:bg-gray-400"
            >
              {isLoading ? 'กำลังวิเคราะห์...' : 'ประเมินราคา'}
            </button>
          </form>

          {errorMsg && (
            <div className="mt-6 p-4 bg-red-50 text-red-700 rounded-md border border-red-200 text-sm">
              {errorMsg}
            </div>
          )}
        </div>

        {/* ฝั่งผลลัพธ์ (ขวา) */}
        <div className="w-full lg:w-1/3 space-y-6">
          <div className={`p-6 rounded-xl border ${aiPrice !== null ? 'bg-blue-50 border-blue-200 shadow-sm' : 'bg-white border-gray-200'}`}>
            <h2 className="text-sm text-blue-800 font-bold mb-2">ราคากลางประเมิน (AI)</h2>
            {aiPrice !== null ? (
              <div>
                <p className="text-3xl font-bold text-blue-700 mb-1">£{aiPrice.toLocaleString()}</p>
                <p className="text-xs text-gray-500">* ราคาต้นทุน 100% จาก ML Model</p>
              </div>
            ) : <p className="text-gray-400 text-sm italic">รอผลการประเมิน...</p>}
          </div>

          <div className={`p-6 rounded-xl border ${resultPrice !== null ? 'bg-green-50 border-green-200 shadow-sm' : 'bg-white border-gray-200'}`}>
            <h2 className="text-sm text-green-800 font-bold mb-2">ราคาเสนอซื้อให้ลูกค้า</h2>
            {resultPrice !== null ? (
              <div>
                <p className="text-3xl font-bold text-green-600 mb-1">£{resultPrice.toLocaleString()}</p>
                <p className="text-xs text-green-700">* หักเปอร์เซ็นต์ส่วนต่างแล้ว</p>
              </div>
            ) : <p className="text-gray-400 text-sm italic">รอผลการประเมิน...</p>}
          </div>
        </div>

      </div>
    </div>
  );
}