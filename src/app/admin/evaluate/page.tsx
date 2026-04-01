'use client';
import { useState, useEffect } from 'react';

export default function AdminEvaluatePage() {
  // --- 1. State สำหรับ API ---
  const [brands, setBrands] = useState<string[]>([]);
  const [models, setModels] = useState<string[]>([]);
  const [transmissions, setTransmissions] = useState<string[]>([]);
  const [fuels, setFuels] = useState<string[]>([]);

  // --- 2. State สำหรับ Form ---
  const [formData, setFormData] = useState({
    brand: '', model: '', year: '', transmission: '',
    mileage: '', fuelType: '', tax: '', mpg: '', engineSize: ''
  });

  const [brandSearch, setBrandSearch] = useState('');
  const [modelSearch, setModelSearch] = useState('');
  const [showBrandList, setShowBrandList] = useState(false);
  const [showModelList, setShowModelList] = useState(false);
  
  const [resultPrice, setResultPrice] = useState<number | null>(null);
  const [aiPrice, setAiPrice] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // --- 3. ดึงข้อมูล Features ตอนเปิดเว็บ ---
  useEffect(() => {
    const fetchFeatures = async () => {
      try {
        const res = await fetch('/api/ml/features');
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

  // --- 4. เลือก Brand -> โหลด Model ---
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
    if (!userDataStr || userDataStr === "undefined") {
      setErrorMsg('กรุณาเข้าสู่ระบบก่อนใช้งาน');
      setIsLoading(false);
      return;
    }

    try {
      const userData = JSON.parse(userDataStr);
      const userPhone = userData.phone || "000-000-0000";

      const response = await fetch('/api/valuation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: userData.id || userData.userId,
          phone: userPhone,
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

  const filteredBrands = brands.filter(b => b.toLowerCase().includes(brandSearch.toLowerCase()));
  const filteredModels = models.filter(m => m.toLowerCase().includes(modelSearch.toLowerCase()));

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto font-sans relative z-10">
      
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-black text-slate-800 tracking-tight drop-shadow-sm">ประเมินราคารถยนต์</h1>
        <p className="text-slate-500 mt-2 font-medium">คำนวณราคากลางและราคาเสนอซื้อด้วย Machine Learning</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* ฝั่งฟอร์ม (ซ้าย - 8 ส่วน) */}
        <div className="lg:col-span-8">
          <div className="bg-white/80 backdrop-blur-xl border border-slate-200 rounded-3xl shadow-xl shadow-slate-200/40 p-6 md:p-8">
            <h2 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
              <span className="text-blue-600">📋</span> ระบุสเปครถยนต์
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              
              {/* แถวที่ 1: ยี่ห้อ และ รุ่น (แบ่ง 2 ช่อง) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="relative">
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">ยี่ห้อ (Brand)</label>
                  <input 
                    type="text"
                    placeholder="พิมพ์ค้นหายี่ห้อ..."
                    className="w-full bg-slate-50/50 border border-slate-200 px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800 font-medium transition-all"
                    value={brandSearch}
                    onChange={(e) => { 
                      setBrandSearch(e.target.value); 
                      setShowBrandList(true); 
                      if(formData.model) {
                         setFormData({...formData, brand: '', model: ''});
                         setModelSearch('');
                      }
                    }}
                    onFocus={() => setShowBrandList(true)}
                    required
                  />
                  {showBrandList && brandSearch && (
                    <ul className="absolute z-50 w-full mt-1 bg-white border border-slate-200 rounded-xl shadow-xl max-h-48 overflow-y-auto">
                      {filteredBrands.map(b => (
                        <li key={b} onClick={() => handleBrandSelect(b)} className="p-3 hover:bg-blue-50 cursor-pointer border-b border-slate-50 text-sm font-medium text-slate-700 last:border-0">{b}</li>
                      ))}
                      {filteredBrands.length === 0 && <li className="p-3 text-sm text-slate-400 italic">ไม่พบยี่ห้อนี้</li>}
                    </ul>
                  )}
                </div>

                <div className="relative">
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">รุ่น (Model)</label>
                  <input 
                    type="text"
                    placeholder={!formData.brand ? "เลือกยี่ห้อก่อน" : "พิมพ์ค้นหารุ่น..."}
                    className="w-full bg-slate-50/50 border border-slate-200 px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800 font-medium disabled:bg-slate-100 disabled:text-slate-400 transition-all"
                    value={modelSearch}
                    onChange={(e) => { setModelSearch(e.target.value); setShowModelList(true); }}
                    onFocus={() => setShowModelList(true)}
                    disabled={!formData.brand || models.length === 0}
                    required
                  />
                  {showModelList && modelSearch && (
                    <ul className="absolute z-50 w-full mt-1 bg-white border border-slate-200 rounded-xl shadow-xl max-h-48 overflow-y-auto">
                      {filteredModels.map(m => (
                        <li key={m} onClick={() => handleModelSelect(m)} className="p-3 hover:bg-blue-50 cursor-pointer border-b border-slate-50 text-sm font-medium text-slate-700 last:border-0">{m}</li>
                      ))}
                      {filteredModels.length === 0 && <li className="p-3 text-sm text-slate-400 italic">ไม่พบรุ่นนี้</li>}
                    </ul>
                  )}
                </div>
              </div>

              {/* แถวที่ 2: ปี, เลขไมล์, ขนาดเครื่อง (แบ่ง 3 ช่อง) */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">ปี (Year)</label>
                  <input type="number" name="year" required value={formData.year} className="w-full bg-slate-50/50 border border-slate-200 px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800 font-medium transition-all" onChange={(e) => setFormData({...formData, year: e.target.value})} placeholder="2020" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">เลขไมล์</label>
                  <input type="number" name="mileage" required value={formData.mileage} className="w-full bg-slate-50/50 border border-slate-200 px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800 font-medium transition-all" onChange={(e) => setFormData({...formData, mileage: e.target.value})} placeholder="50000" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">เครื่องยนต์ (L)</label>
                  <input type="number" step="0.1" name="engineSize" required value={formData.engineSize} className="w-full bg-slate-50/50 border border-slate-200 px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800 font-medium transition-all" onChange={(e) => setFormData({...formData, engineSize: e.target.value})} placeholder="1.5" />
                </div>
              </div>

              {/* แถวที่ 3: เกียร์, เชื้อเพลิง, ภาษี, MPG (แบ่ง 4 ช่อง หรือ 2x2 ในมือถือ) */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">เกียร์</label>
                  <select name="transmission" required value={formData.transmission} className="w-full bg-slate-50/50 border border-slate-200 px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800 font-medium transition-all appearance-none" onChange={(e) => setFormData({...formData, transmission: e.target.value})}>
                    <option value="" disabled>เลือกเกียร์</option>
                    {transmissions.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">เชื้อเพลิง</label>
                  <select name="fuelType" required value={formData.fuelType} className="w-full bg-slate-50/50 border border-slate-200 px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800 font-medium transition-all appearance-none" onChange={(e) => setFormData({...formData, fuelType: e.target.value})}>
                    <option value="" disabled>เลือก</option>
                    {fuels.map(f => <option key={f} value={f}>{f}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">ภาษี (Tax)</label>
                  <input type="number" name="tax" required value={formData.tax} className="w-full bg-slate-50/50 border border-slate-200 px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800 font-medium transition-all" onChange={(e) => setFormData({...formData, tax: e.target.value})} placeholder="145" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">กินน้ำมัน (MPG)</label>
                  <input type="number" step="0.1" name="mpg" required value={formData.mpg} className="w-full bg-slate-50/50 border border-slate-200 px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800 font-medium transition-all" onChange={(e) => setFormData({...formData, mpg: e.target.value})} placeholder="55.4" />
                </div>
              </div>

              <div className="pt-4">
                <button 
                  type="submit" 
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold py-4 rounded-xl shadow-lg shadow-blue-200 transition-transform active:scale-95 disabled:from-slate-400 disabled:to-slate-400 disabled:shadow-none"
                >
                  {isLoading ? '⏳ กำลังประมวลผลผ่าน AI...' : 'ประเมินราคา'}
                </button>
              </div>

            </form>

            {errorMsg && (
              <div className="mt-6 p-4 bg-red-50 text-red-600 rounded-xl border border-red-200 text-sm font-medium">
                {errorMsg}
              </div>
            )}
          </div>
        </div>

        {/* ฝั่งผลลัพธ์ (ขวา - 4 ส่วน) เลื่อนตามจอ (Sticky) */}
        <div className="lg:col-span-4 sticky top-8 space-y-6">
          
          {/* กล่องราคา AI */}
          <div className="bg-slate-800 rounded-3xl p-6 shadow-xl border border-slate-700 relative overflow-hidden">
            <div className="absolute -right-4 -top-4 w-24 h-24 bg-blue-500 rounded-full blur-2xl opacity-20"></div>
            <h2 className="text-xs font-bold text-blue-300 uppercase tracking-widest mb-2">ราคากลางประเมิน (AI)</h2>
            {aiPrice !== null ? (
              <div>
                <p className="text-4xl font-black text-white mb-1">£{aiPrice.toLocaleString()}</p>
                <p className="text-xs text-slate-400 font-medium">* ราคาต้นทุน 100% จาก ML Model</p>
              </div>
            ) : <p className="text-slate-500 text-sm italic py-2">รอผลการประเมิน...</p>}
          </div>

          {/* กล่องราคาเสนอซื้อ */}
          <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-3xl p-6 shadow-xl shadow-emerald-200/50 relative overflow-hidden">
            <div className="absolute -right-4 -top-4 w-24 h-24 bg-white rounded-full blur-2xl opacity-20"></div>
            <h2 className="text-xs font-bold text-emerald-100 uppercase tracking-widest mb-2">ราคาเสนอซื้อให้ลูกค้า</h2>
            {resultPrice !== null ? (
              <div>
                <p className="text-4xl font-black text-white mb-1 drop-shadow-sm">£{resultPrice.toLocaleString()}</p>
                <p className="text-xs text-emerald-100 font-medium">* หักเปอร์เซ็นต์ส่วนต่างเรียบร้อยแล้ว</p>
              </div>
            ) : <p className="text-emerald-200/70 text-sm italic py-2">รอผลการประเมิน...</p>}
          </div>

          {/* ปุ่มเคลียร์ฟอร์ม (โผล่มาตอนประเมินเสร็จ) */}
          {resultPrice !== null && (
            <button 
              onClick={() => {
                setFormData({brand: '', model: '', year: '', transmission: '', mileage: '', fuelType: '', tax: '', mpg: '', engineSize: ''});
                setBrandSearch(''); setModelSearch(''); setResultPrice(null); setAiPrice(null);
              }}
              className="w-full bg-white text-slate-600 border border-slate-200 hover:bg-slate-50 font-bold py-3 rounded-xl shadow-sm transition-all active:scale-95 text-sm"
            >
              🔄 รีเซ็ตข้อมูล / ประเมินคันใหม่
            </button>
          )}

        </div>

      </div>
    </div>
  );
}