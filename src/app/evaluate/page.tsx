'use client';
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation'; // นำเข้า useRouter สำหรับการเปลี่ยนหน้า

export default function EvaluatePage() {
  const router = useRouter(); // เรียกใช้งาน router

  // --- 1. State สำหรับเก็บข้อมูลจาก API ---
  const [brands, setBrands] = useState<string[]>([]);
  const [models, setModels] = useState<string[]>([]);
  const [transmissions, setTransmissions] = useState<string[]>([]);
  const [fuels, setFuels] = useState<string[]>([]);

  // --- 2. State สำหรับฟอร์มและ UI ---
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

  // Refs
  const modelRef = useRef<HTMLDivElement>(null);
  const detailsRef = useRef<HTMLDivElement>(null);
  const resultRef = useRef<HTMLDivElement>(null);

  // --- 3. ดึงข้อมูล Features ---
  useEffect(() => {
    const fetchFeatures = async () => {
      try {
        const res = await fetch('/api/ml/features');
        const contentType = res.headers.get("content-type");
        if (!res.ok || !contentType || !contentType.includes("application/json")) {
          throw new Error("ไม่สามารถดึงข้อมูล Features ได้ (API หาไม่เจอหรือ Server ล่ม)");
        }
        const data = await res.json();
        setBrands(data.brands || []);
        setTransmissions(data.transmissions || []);
        setFuels(data.fuelTypes || data.fuels || []);
      } catch (error: any) {
        setErrorMsg("ระบบค้นหาขัดข้อง: " + error.message);
      }
    };
    fetchFeatures();
  }, []);

  // --- 4. Logic การเลือก Brand และดึง Model ---
  const handleBrandSelect = async (brand: string) => {
    setFormData({ ...formData, brand, model: '' });
    setBrandSearch(brand);
    setModelSearch('');
    setShowBrandList(false);
    setIsLoading(true);

    try {
      const res = await fetch(`/api/ml/models/${brand}`);
      if (!res.ok) throw new Error("ไม่พบข้อมูลรุ่นรถ");
      const data = await res.json();
      setModels(data.models || []);
      setTimeout(() => modelRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 100);
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleModelSelect = (m: string) => {
    setFormData({ ...formData, model: m });
    setModelSearch(m);
    setShowModelList(false);
    setTimeout(() => detailsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100);
  };

  // --- 5. Submit ฟอร์ม ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg('');
    
    const userDataStr = localStorage.getItem('user');
    if (!userDataStr || userDataStr === "undefined") {
      setErrorMsg('กรุณาเข้าสู่ระบบก่อนใช้งานครับ');
      setIsLoading(false);
      return;
    }
    
    const userData = JSON.parse(userDataStr);
    const userPhone = userData.phone || "000-000-0000"; 

    try {
      const response = await fetch('/api/valuation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: userData.id || userData.userId,
          phone: userPhone, 
          carSpecs: {
            ...formData,
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
      
      setTimeout(() => resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 200);

    } catch (error: any) {
      setErrorMsg(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  // --- 6. Reset ฟอร์มเริ่มใหม่ ---
  const handleReset = () => {
    setFormData({
      brand: '', model: '', year: '', transmission: '',
      mileage: '', fuelType: '', tax: '', mpg: '', engineSize: ''
    });
    setBrandSearch('');
    setModelSearch('');
    setModels([]);
    setResultPrice(null);
    setAiPrice(null);
    setErrorMsg('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // --- 7. ฟังก์ชัน ออกจากระบบ ---
  const handleLogout = () => {
    if (confirm('คุณต้องการออกจากระบบใช่หรือไม่?')) {
      localStorage.removeItem('user'); // ลบข้อมูลใน Local Storage
      router.push('/login'); // เด้งกลับไปหน้า login
    }
  };

  const filteredBrands = brands.filter(b => b.toLowerCase().includes(brandSearch.toLowerCase()));
  const filteredModels = models.filter(m => m.toLowerCase().includes(modelSearch.toLowerCase()));

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4 font-sans relative">
      
      {/* ปุ่มออกจากระบบ (มุมขวาบน) */}
      <div className="absolute top-4 right-4 md:top-8 md:right-8 z-50">
        <button 
          onClick={handleLogout}
          className="flex items-center gap-2 bg-white text-red-500 border border-red-200 hover:bg-red-50 px-4 py-2.5 rounded-xl shadow-sm transition-all text-sm font-bold active:scale-95"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          ออกจากระบบ
        </button>
      </div>

      <div className="max-w-3xl mx-auto space-y-8 relative pt-8 md:pt-0">
        
        <div className="text-center mb-8">
          <h1 className="text-3xl font-black text-gray-800">ระบบประเมินราคารถยนต์</h1>
          <p className="text-gray-500 mt-2">วิเคราะห์ด้วย Machine Learning (กรุณาเลือกตามลำดับ)</p>
        </div>

        {/* --- ส่วนฟอร์ม --- */}
        <AnimatePresence>
          {resultPrice === null && (
            <motion.div 
              initial={{ opacity: 1 }}
              exit={{ opacity: 0, height: 0, overflow: 'hidden' }}
              transition={{ duration: 0.5 }}
              className="space-y-8"
            >
              
              {/* STEP 1: BRAND */}
              <div className="bg-white p-6 md:p-8 rounded-3xl border border-gray-100 shadow-xl shadow-gray-200/40 relative z-30">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold shadow-md">1</div>
                  <h2 className="text-xl font-bold text-gray-800">เลือกยี่ห้อรถยนต์</h2>
                </div>
                <div className="relative pl-14">
                  <input 
                    type="text"
                    placeholder="พิมพ์เพื่อค้นหายี่ห้อ... (เช่น Audi)"
                    className="w-full p-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-400 outline-none transition-all text-black font-medium"
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
                  />
                  <AnimatePresence>
                    {showBrandList && brandSearch && (
                      <motion.ul className="absolute z-50 w-[calc(100%-3.5rem)] mt-2 bg-white border border-gray-100 rounded-2xl shadow-2xl max-h-60 overflow-y-auto">
                        {filteredBrands.map(b => (
                          <li key={b} onClick={() => handleBrandSelect(b)} className="p-4 hover:bg-blue-50 cursor-pointer border-b border-gray-50 last:border-0 text-black font-medium">{b}</li>
                        ))}
                        {filteredBrands.length === 0 && <li className="p-4 text-gray-400 italic">ไม่พบยี่ห้อนี้</li>}
                      </motion.ul>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              {/* STEP 2: MODEL */}
              <div ref={modelRef} className={`bg-white p-6 md:p-8 rounded-3xl border border-gray-100 shadow-xl shadow-gray-200/40 relative z-20 transition-all duration-500 ${formData.brand ? "opacity-100" : "opacity-30 pointer-events-none"}`}>
                <div className="flex items-center gap-4 mb-4">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold shadow-md transition-colors ${formData.brand ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-400'}`}>2</div>
                  <h2 className="text-xl font-bold text-gray-800">เลือกรุ่นรถยนต์</h2>
                </div>
                <div className="relative pl-14">
                  <input 
                    type="text"
                    placeholder={isLoading ? "กำลังโหลดข้อมูลรุ่น..." : "พิมพ์เพื่อค้นหารุ่น..."}
                    className="w-full p-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-400 outline-none transition-all text-black font-medium"
                    value={modelSearch}
                    onChange={(e) => { setModelSearch(e.target.value); setShowModelList(true); }}
                    onFocus={() => setShowModelList(true)}
                  />
                  <AnimatePresence>
                    {showModelList && modelSearch && (
                      <motion.ul className="absolute z-50 w-[calc(100%-3.5rem)] mt-2 bg-white border border-gray-100 rounded-2xl shadow-2xl max-h-60 overflow-y-auto">
                        {filteredModels.map(m => (
                          <li key={m} onClick={() => handleModelSelect(m)} className="p-4 hover:bg-blue-50 cursor-pointer border-b border-gray-50 last:border-0 text-black font-medium">{m}</li>
                        ))}
                        {filteredModels.length === 0 && <li className="p-4 text-gray-400 italic">ไม่พบรุ่นนี้</li>}
                      </motion.ul>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              {/* STEP 3: DETAILS */}
              <div ref={detailsRef} className={`bg-white p-6 md:p-8 rounded-3xl border border-gray-100 shadow-xl shadow-gray-200/40 relative z-10 transition-all duration-700 ${formData.model ? "opacity-100" : "opacity-0 translate-y-10 pointer-events-none"}`}>
                <div className="flex items-center gap-4 mb-6">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold shadow-md transition-colors ${formData.model ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-400'}`}>3</div>
                  <h2 className="text-xl font-bold text-gray-800">ระบุรายละเอียดอื่นๆ</h2>
                </div>
                
                <form onSubmit={handleSubmit} className="pl-14 space-y-6">
                  <div className="grid grid-cols-2 gap-4 md:gap-6">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-gray-400 uppercase tracking-wide">ปีรถยนต์</label>
                      <input type="number" name="year" required value={formData.year} className="w-full p-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-400 text-black font-medium outline-none" onChange={(e) => setFormData({...formData, year: e.target.value})} placeholder="เช่น 2020" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-gray-400 uppercase tracking-wide">เลขไมล์</label>
                      <input type="number" name="mileage" required value={formData.mileage} className="w-full p-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-400 text-black font-medium outline-none" onChange={(e) => setFormData({...formData, mileage: e.target.value})} placeholder="เช่น 50000" />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 md:gap-6">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-gray-400 uppercase tracking-wide">เกียร์</label>
                      <select name="transmission" required value={formData.transmission} className="w-full p-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-400 text-black font-medium outline-none" onChange={(e) => setFormData({...formData, transmission: e.target.value})}>
                        <option value="" disabled>เลือกเกียร์</option>
                        {transmissions.map(t => <option key={t} value={t}>{t}</option>)}
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-gray-400 uppercase tracking-wide">เชื้อเพลิง</label>
                      <select name="fuelType" required value={formData.fuelType} className="w-full p-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-400 text-black font-medium outline-none" onChange={(e) => setFormData({...formData, fuelType: e.target.value})}>
                        <option value="" disabled>เลือกเชื้อเพลิง</option>
                        {fuels.map(f => <option key={f} value={f}>{f}</option>)}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4 md:gap-6">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-gray-400 uppercase tracking-wide">ภาษี</label>
                      <input type="number" name="tax" required value={formData.tax} className="w-full p-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-400 text-black font-medium outline-none" onChange={(e) => setFormData({...formData, tax: e.target.value})} placeholder="145" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-gray-400 uppercase tracking-wide">อัตรากินน้ำมัน</label>
                      <input type="number" step="0.1" name="mpg" required value={formData.mpg} className="w-full p-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-400 text-black font-medium outline-none" onChange={(e) => setFormData({...formData, mpg: e.target.value})} placeholder="55.4" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-gray-400 uppercase tracking-wide">ขนาดเครื่อง (L)</label>
                      <input type="number" step="0.1" name="engineSize" required value={formData.engineSize} className="w-full p-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-400 text-black font-medium outline-none" onChange={(e) => setFormData({...formData, engineSize: e.target.value})} placeholder="1.5" />
                    </div>
                  </div>

                  <button type="submit" disabled={isLoading} className="w-full mt-8 bg-blue-600 hover:bg-blue-700 text-white font-bold py-5 rounded-2xl shadow-lg shadow-blue-200 transition-all active:scale-95 text-lg disabled:bg-gray-400">
                    {isLoading ? 'กำลังวิเคราะห์ด้วย AI...' : 'เริ่มการประเมินราคา'}
                  </button>

                  {errorMsg && (
                    <div className="p-4 bg-red-50 text-red-600 rounded-xl border border-red-200 text-center text-sm font-medium">
                      {errorMsg}
                    </div>
                  )}
                </form>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* --- ส่วนแสดงผลลัพธ์ --- */}
        <AnimatePresence>
          {resultPrice !== null && (
            <motion.div 
              ref={resultRef}
              initial={{ opacity: 0, scale: 0.9, y: 50 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ type: "spring", bounce: 0.4, duration: 0.8 }}
              className="w-full max-w-2xl mx-auto space-y-6 pt-10"
            >
              
              <div className="bg-green-500 text-white p-10 rounded-[2rem] shadow-2xl shadow-green-200 text-center relative overflow-hidden">
                <div className="absolute -right-10 -top-10 opacity-10">
                   <svg width="200" height="200" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>
                </div>
                <h2 className="text-sm font-bold uppercase tracking-widest opacity-90 mb-4">ราคาเสนอซื้อให้ลูกค้า</h2>
                <p className="text-6xl md:text-7xl font-black tracking-tight mb-4">£{resultPrice.toLocaleString()}</p>
                <p className="text-sm opacity-80 font-light max-w-sm mx-auto"> สามารถติดต่อสอบถามได้ที่ เบอร์ 086-309-4590 </p>
                
                {aiPrice && (
                  <div className="mt-8 pt-6 border-t border-green-400/50 inline-block text-left w-full max-w-xs">
                    <p className="text-xs uppercase font-bold opacity-80 mb-1">ราคากลาง (AI Prediction)</p>
                    <p className="text-2xl font-bold">£{aiPrice.toLocaleString()}</p>
                  </div>
                )}
              </div>

              <button 
                onClick={handleReset}
                className="w-full bg-white text-gray-800 hover:bg-gray-100 border border-gray-200 font-bold py-5 rounded-2xl shadow-sm transition-all active:scale-95 text-lg"
              >
                ประเมินรถคันอื่นใหม่อีกครั้ง
              </button>

            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
}