'use client';
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function AdminEvaluatePage() {
  // --- 1. State สำหรับเก็บข้อมูลจาก API ---
  const [brands, setBrands] = useState<string[]>([]);
  const [models, setModels] = useState<string[]>([]);
  const [transmissions, setTransmissions] = useState<string[]>([]);
  const [fuels, setFuels] = useState<string[]>([]);

  // --- 2. State สำหรับฟอร์มและ UI ---
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

  // Refs สำหรับเลื่อนหน้าจอ
  const modelRef = useRef<HTMLDivElement>(null);
  const detailsRef = useRef<HTMLDivElement>(null);

  // --- 3. ดึงข้อมูล Features (แก้ปัญหา JSON Error ด้วยการเช็ค Content-Type) ---
  useEffect(() => {
    const fetchFeatures = async () => {
      try {
        const res = await fetch('/api/ml/features');
        const contentType = res.headers.get("content-type");
        
        if (!res.ok || !contentType || !contentType.includes("application/json")) {
          throw new Error("ไม่สามารถดึงข้อมูล Features ได้ (API คืนค่าเป็น HTML/404)");
        }

        const data = await res.json();
        // เอาบรรทัด localStorage.setItem ที่ทำให้เกิดบั๊ก "undefined" ออกไปแล้ว
        setBrands(data.brands || []);
        setTransmissions(data.transmissions || []);
        setFuels(data.fuelTypes || data.fuels || []);
      } catch (error: any) {
        console.error("Fetch error:", error.message);
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
      
      // เลื่อนหน้าจอลงมาที่ส่วนเลือกรุ่น
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
    // เลื่อนหน้าจอไปส่วนกรอกรายละเอียด
    setTimeout(() => detailsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg('');
    
    const userDataStr = localStorage.getItem('user');
    // ดักจับทั้งกรณีที่ไม่มีข้อมูล และกรณีที่ค่าเป็นตัวอักษร "undefined"
    if (!userDataStr || userDataStr === "undefined") {
      setErrorMsg('กรุณาเข้าสู่ระบบก่อนครับ');
      setIsLoading(false);
      return;
    }
    
    const userData = JSON.parse(userDataStr);

    try {
      const response = await fetch('/api/valuation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          // เปลี่ยนเป็น userData.id ตามที่ AuthController.ts ส่งกลับมา
          userId: userData.id || userData.userId,
          phone: formData.phone || "000-000-0000",
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
    } catch (error: any) {
      setErrorMsg(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  // กรองข้อมูลตัวเลือก
  const filteredBrands = brands.filter(b => b.toLowerCase().includes(brandSearch.toLowerCase()));
  const filteredModels = models.filter(m => m.toLowerCase().includes(modelSearch.toLowerCase()));

  return (
    <div className="p-8 bg-gray-50 min-h-screen font-sans">
      <div className="max-w-5xl mx-auto">
        <div className="mb-10 text-center">
          <h1 className="text-3xl font-black text-gray-800">Admin Car Valuation</h1>
          <p className="text-gray-500 mt-2">วิเคราะห์ราคาแม่นยำด้วยระบบ Machine Learning</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8 relative">
          
          {/* ส่วนฟอร์ม (2/3) */}
          <div className="lg:col-span-2 space-y-12 relative">
            
            {/* STEP 1: BRAND */}
            <section className="relative">
              <div className="absolute left-6 top-14 bottom-[-48px] w-0.5 border-l-2 border-dashed border-blue-200 z-0"></div>
              <div className="relative z-10 flex gap-6">
                <div className="flex-none w-12 h-12 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold shadow-lg shadow-blue-200 ring-4 ring-white">1</div>
                <div className="flex-1">
                  <h2 className="text-xl font-bold mb-4 text-gray-800">เลือกยี่ห้อรถยนต์</h2>
                  <div className="relative">
                    <input 
                      type="text"
                      placeholder="พิมพ์เพื่อค้นหายี่ห้อ... (เช่น Audi)"
                      className="w-full p-4 bg-white border border-gray-200 rounded-2xl focus:ring-4 focus:ring-blue-100 outline-none transition-all text-black"
                      value={brandSearch}
                      onChange={(e) => { setBrandSearch(e.target.value); setShowBrandList(true); }}
                      onFocus={() => setShowBrandList(true)}
                    />
                    <AnimatePresence>
                      {showBrandList && brandSearch && (
                        <motion.ul className="absolute z-50 w-full mt-2 bg-white border border-gray-100 rounded-2xl shadow-2xl max-h-60 overflow-y-auto">
                          {filteredBrands.map(b => (
                            <li key={b} onClick={() => handleBrandSelect(b)} className="p-4 hover:bg-blue-50 cursor-pointer border-b border-gray-50 last:border-0 text-black font-medium">{b}</li>
                          ))}
                        </motion.ul>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              </div>
            </section>

            {/* STEP 2: MODEL */}
            <section ref={modelRef} className={`relative transition-all duration-500 ${formData.brand ? "opacity-100" : "opacity-20 pointer-events-none"}`}>
              <div className="absolute left-6 top-14 bottom-[-48px] w-0.5 border-l-2 border-dashed border-blue-200 z-0"></div>
              <div className="relative z-10 flex gap-6">
                <div className={`flex-none w-12 h-12 rounded-full flex items-center justify-center font-bold shadow-lg ring-4 ring-white ${formData.brand ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-400"}`}>2</div>
                <div className="flex-1">
                  <h2 className="text-xl font-bold mb-4">เลือกรุ่นรถยนต์</h2>
                  <div className="relative">
                    <input 
                      type="text"
                      placeholder={isLoading ? "กำลังโหลด..." : "พิมพ์เพื่อค้นหารุ่น..."}
                      className="w-full p-4 bg-white border border-gray-200 rounded-2xl focus:ring-4 focus:ring-blue-100 outline-none transition-all text-black"
                      value={modelSearch}
                      onChange={(e) => { setModelSearch(e.target.value); setShowModelList(true); }}
                      onFocus={() => setShowModelList(true)}
                    />
                    <AnimatePresence>
                      {showModelList && modelSearch && (
                        <motion.ul className="absolute z-50 w-full mt-2 bg-white border border-gray-100 rounded-2xl shadow-2xl max-h-60 overflow-y-auto">
                          {filteredModels.map(m => (
                            <li key={m} onClick={() => handleModelSelect(m)} className="p-4 hover:bg-blue-50 cursor-pointer border-b border-gray-50 last:border-0 text-black font-medium">{m}</li>
                          ))}
                        </motion.ul>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              </div>
            </section>

            {/* STEP 3: DETAILS */}
            <section ref={detailsRef} className={`relative transition-all duration-700 ${formData.model ? "opacity-100" : "opacity-0 translate-y-10 pointer-events-none"}`}>
              <div className="relative z-10 flex gap-6">
                <div className={`flex-none w-12 h-12 rounded-full flex items-center justify-center font-bold shadow-lg ring-4 ring-white ${formData.model ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-400"}`}>3</div>
                <div className="flex-1 bg-white p-8 rounded-3xl border border-gray-100 shadow-xl shadow-gray-200/50">
                  <h2 className="text-xl font-bold mb-6 text-gray-800">ระบุรายละเอียดสเปค</h2>
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-400 uppercase">ปีรถยนต์</label>
                        <input type="number" name="year" required value={formData.year} className="w-full p-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-blue-500 text-black" onChange={(e) => setFormData({...formData, year: e.target.value})} placeholder="เช่น 2020" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-400 uppercase">เลขไมล์</label>
                        <input type="number" name="mileage" required value={formData.mileage} className="w-full p-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-blue-500 text-black" onChange={(e) => setFormData({...formData, mileage: e.target.value})} placeholder="เช่น 50000" />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-400 uppercase">เกียร์</label>
                        <select name="transmission" required value={formData.transmission} className="w-full p-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-blue-500 text-black outline-none" onChange={(e) => setFormData({...formData, transmission: e.target.value})}>
                          <option value="">เลือกเกียร์</option>
                          {transmissions.map(t => <option key={t} value={t}>{t}</option>)}
                        </select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-400 uppercase">เชื้อเพลิง</label>
                        <select name="fuelType" required value={formData.fuelType} className="w-full p-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-blue-500 text-black outline-none" onChange={(e) => setFormData({...formData, fuelType: e.target.value})}>
                          <option value="">เลือกเชื้อเพลิง</option>
                          {fuels.map(f => <option key={f} value={f}>{f}</option>)}
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-400 uppercase">ขนาดเครื่องยนต์ (L)</label>
                        <input type="number" step="0.1" name="engineSize" required value={formData.engineSize} className="w-full p-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-blue-500 text-black" onChange={(e) => setFormData({...formData, engineSize: e.target.value})} placeholder="เช่น 1.5" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-400 uppercase">เบอร์ติดต่อ</label>
                        <input type="text" name="phone" value={formData.phone} className="w-full p-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-blue-500 text-black" onChange={(e) => setFormData({...formData, phone: e.target.value})} placeholder="000-000-0000" />
                      </div>
                    </div>

                    <button type="submit" disabled={isLoading} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-2xl shadow-lg shadow-blue-200 transition-all active:scale-95 text-lg disabled:bg-gray-400">
                      {isLoading ? 'กำลังวิเคราะห์ด้วย AI...' : 'เริ่มการประเมินราคา'}
                    </button>
                  </form>
                </div>
              </div>
            </section>
          </div>

          {/* ส่วนแสดงผล (1/3) */}
          <div className="lg:col-span-1 space-y-6">
            <div className="sticky top-8 space-y-6">
              <div className={`p-8 rounded-3xl border transition-all duration-500 ${aiPrice !== null ? 'bg-blue-600 text-white shadow-2xl shadow-blue-200 scale-105 border-transparent' : 'bg-white border-gray-100 text-gray-400'}`}>
                <h2 className="text-sm font-bold uppercase tracking-widest opacity-80 mb-4">ราคากลาง (AI Prediction)</h2>
                {aiPrice !== null ? (
                  <div>
                    <p className="text-5xl font-black mb-2">£{aiPrice.toLocaleString()}</p>
                    <p className="text-xs opacity-70 italic font-light">* ผลลัพธ์โดยตรงจาก Machine Learning Model</p>
                  </div>
                ) : <p className="italic">รอการวิเคราะห์ข้อมูล...</p>}
              </div>

              <div className={`p-8 rounded-3xl border transition-all duration-500 ${resultPrice !== null ? 'bg-green-500 text-white shadow-2xl shadow-green-200 scale-105 border-transparent' : 'bg-white border-gray-100 text-gray-400'}`}>
                <h2 className="text-sm font-bold uppercase tracking-widest opacity-80 mb-4">ราคาเสนอซื้อจริง</h2>
                {resultPrice !== null ? (
                  <div>
                    <p className="text-5xl font-black mb-2">£{resultPrice.toLocaleString()}</p>
                    <p className="text-xs opacity-70 italic font-light">* หักค่าดำเนินการและกำไรส่วนต่างแล้ว</p>
                  </div>
                ) : <p className="italic">รอสรุปราคา...</p>}
              </div>

              {errorMsg && (
                <div className="p-4 bg-red-100 text-red-600 rounded-2xl border border-red-200 text-center text-sm font-medium animate-pulse">
                  {errorMsg}
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}