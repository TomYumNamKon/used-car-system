'use client';
import { useEffect, useState, FormEvent } from 'react';

export default function AdminSalesPage() {
  const [sales, setSales] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isRetraining, setIsRetraining] = useState(false); 

  const [brandsList, setBrandsList] = useState<string[]>([]);
  const [modelsList, setModelsList] = useState<string[]>([]);
  const [transmissionsList, setTransmissionsList] = useState<string[]>([]);
  const [fuelsList, setFuelsList] = useState<string[]>([]);

  const [brand, setBrand] = useState('');
  const [model, setModel] = useState('');
  const [year, setYear] = useState('');
  const [engineSize, setEngineSize] = useState(''); 
  const [mileage, setMileage] = useState('');
  const [transmission, setTransmission] = useState('');
  const [fuel, setFuel] = useState('');
  const [tax, setTax] = useState('');
  const [mpg, setMpg] = useState('');
  const [actualPrice, setActualPrice] = useState('');

  const fetchSales = async () => {
    try {
      const res = await fetch('/api/admin/sales');
      if (res.ok) {
        const data = await res.json();
        setSales(data || []);
      }
    } catch (err) { console.error(err); }
  };

  useEffect(() => {
    fetchSales();
    fetch('/api/ml/features').then(res => res.json()).then(data => {
      setBrandsList(data.brands || []);
      setTransmissionsList(data.transmissions || []);
      setFuelsList(data.fuelTypes || data.fuels || []);
    });
  }, []);

  useEffect(() => {
    if (brand) {
      fetch(`/api/ml/models/${brand}`).then(res => res.json()).then(data => {
        setModelsList(data.models || data || []);
      });
    }
  }, [brand]);

  const handleBrandChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setBrand(e.target.value);
    setModel(''); 
  };

  const handleRetrain = async () => {
    if (!confirm("คุณต้องการเริ่มกระบวนการสอน AI ด้วยข้อมูลการขายล่าสุดใช่หรือไม่? (กระบวนการนี้จะทำงานเบื้องหลัง)")) return;
    
    setIsRetraining(true);
    try {
      const res = await fetch('/api/ml/retrain', { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        alert(data.message || "เริ่มการเทรนข้อมูลสำเร็จ!");
      } else {
        alert("ไม่สามารถเริ่มการเทรนข้อมูลได้");
      }
    } catch (error) {
      alert("เกิดข้อผิดพลาดในการเชื่อมต่อ");
    } finally {
      setIsRetraining(false);
    }
  };

  const handleAddManualSale = async (e: FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    
    const carSpecsJson = JSON.stringify({ 
      brand, model, year, engineSize, mileage, transmission, fuel, tax, mpg 
    });
    
    try {
      const res = await fetch('/api/admin/sales', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ car_specs: carSpecsJson, actual_sale_price: Number(actualPrice) })
      });
      if (res.ok) {
        alert("บันทึกข้อมูลสำเร็จ!");
        setIsModalOpen(false);
        setBrand(''); setModel(''); setYear(''); setEngineSize(''); setMileage(''); 
        setTransmission(''); setFuel(''); setTax(''); setMpg(''); setActualPrice('');
        fetchSales();
      }
    } finally { setIsSaving(false); }
  };

  const parseSpecs = (specsStr: string) => {
    try {
      const obj = JSON.parse(specsStr);
      
      const details = [
        obj.engineSize ? `เครื่อง ${obj.engineSize}` : '', 
        obj.transmission, 
        obj.fuel, 
        obj.mileage ? `เลขไมล์ ${Number(obj.mileage).toLocaleString()} กม.` : '',
        obj.tax ? `ภาษี ${obj.tax}` : '',
        obj.mpg ? `${obj.mpg} MPG` : ''
      ].filter(Boolean).join(' | ');

      return (
        <div>
          <div className="font-bold text-slate-800 text-base">
            {obj.brand || ''} {obj.model || ''} {obj.year ? <span className="text-slate-500 font-medium ml-1">({obj.year})</span> : ''}
          </div>
          <div className="text-xs text-slate-500 mt-1 font-medium">{details}</div>
        </div>
      );
    } catch { return specsStr; }
  };

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto font-sans relative z-10">
      
      {/* Header & Buttons */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight drop-shadow-sm">ข้อมูลการขาย (Sales Dataset)</h1>
          <p className="text-slate-500 mt-2 font-medium">ข้อมูลทั้งหมด {sales.length} รายการสำหรับใช้ Retrain AI</p>
        </div>
        
        <div className="flex flex-wrap gap-3">
          <button 
            onClick={handleRetrain}
            disabled={isRetraining || sales.length === 0}
            className={`px-6 py-3 rounded-xl font-bold shadow-md transition-all active:scale-95 flex items-center ${
              isRetraining 
                ? 'bg-slate-300 text-slate-500 cursor-not-allowed shadow-none' 
                : 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white shadow-amber-200/50'
            }`}
          >
            <svg className={`w-5 h-5 mr-2 ${isRetraining ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
            </svg>
            {isRetraining ? 'กำลังส่งข้อมูล...' : 'เทรนข้อมูล AI'}
          </button>

          <button 
            onClick={() => setIsModalOpen(true)}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-xl font-bold hover:shadow-lg hover:shadow-blue-200/50 transition-all active:scale-95"
          >
            + เพิ่มการขายใหม่
          </button>
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-white/80 backdrop-blur-xl border border-slate-200 rounded-3xl shadow-xl shadow-slate-200/40 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-slate-700 whitespace-nowrap">
            <thead className="bg-slate-50/50 border-b border-slate-200/80 text-sm uppercase tracking-wider font-bold text-slate-500">
              <tr>
                <th className="p-5 pl-8 w-40">วันที่ขาย</th>
                <th className="p-5 w-auto">รายละเอียดรถ</th>
                <th className="p-5 pr-8 text-right w-48">ราคาขายจริง</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {sales.length === 0 ? (
                <tr>
                  <td colSpan={3} className="p-10 text-center text-slate-400 font-medium italic">
                    ยังไม่มีข้อมูลในระบบ หรือกำลังโหลด...
                  </td>
                </tr>
              ) : (
                sales.map((sale: any) => (
                  <tr key={sale.id} className="hover:bg-blue-50/50 transition-colors group">
                    <td className="p-5 pl-8 align-top font-medium text-slate-600">
                      {new Date(sale.sold_at).toLocaleDateString('th-TH')}
                    </td>
                    <td className="p-5 align-top">
                      {parseSpecs(sale.car_specs)}
                    </td>
                    <td className="p-5 pr-8 text-right align-top">
                      <span className="inline-block px-3 py-1.5 bg-emerald-50 text-emerald-700 font-black rounded-lg border border-emerald-100">
                        £ {sale.actual_sale_price.toLocaleString()}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Popup (เพิ่มข้อมูล) */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex justify-center items-center z-50 p-4">
          <div className="bg-white/95 backdrop-blur-xl border border-white/50 p-6 md:p-8 rounded-[2rem] shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            
            <h2 className="text-2xl font-black mb-6 text-slate-800 tracking-tight">เพิ่มข้อมูลการขายใหม่</h2>
            
            <form onSubmit={handleAddManualSale} className="space-y-5">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">ยี่ห้อ (Brand)</label>
                  <select required value={brand} onChange={handleBrandChange} className="w-full bg-slate-50/50 border border-slate-200 px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800 font-medium transition-all appearance-none">
                    <option value="" disabled>เลือกยี่ห้อ</option>
                    {brandsList.map(b => <option key={b} value={b}>{b}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">รุ่น (Model)</label>
                  <select required value={model} onChange={e => setModel(e.target.value)} disabled={!brand || modelsList.length === 0} className="w-full bg-slate-50/50 border border-slate-200 px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800 font-medium disabled:bg-slate-100 disabled:text-slate-400 transition-all appearance-none">
                    <option value="" disabled>
                      {!brand ? 'กรุณาเลือกยี่ห้อก่อน' : (modelsList.length === 0 ? 'กำลังโหลดรุ่น...' : 'เลือกรุ่น')}
                    </option>
                    {modelsList.map((m: string) => <option key={m} value={m}>{m}</option>)}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-5">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">ปีที่ผลิต (Year)</label>
                  <input type="number" required min="1990" max={new Date().getFullYear()} value={year} onChange={e => setYear(e.target.value)} placeholder="เช่น 2019" className="w-full bg-slate-50/50 border border-slate-200 px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800 font-medium transition-all" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">เครื่องยนต์ (L)</label>
                  <input type="number" step="0.1" required value={engineSize} onChange={e => setEngineSize(e.target.value)} placeholder="เช่น 1.5" className="w-full bg-slate-50/50 border border-slate-200 px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800 font-medium transition-all" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">เลขไมล์</label>
                  <input type="number" required min="0" value={mileage} onChange={e => setMileage(e.target.value)} placeholder="เช่น 50000" className="w-full bg-slate-50/50 border border-slate-200 px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800 font-medium transition-all" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 md:gap-5">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">ระบบเกียร์</label>
                  <select required value={transmission} onChange={e => setTransmission(e.target.value)} className="w-full bg-slate-50/50 border border-slate-200 px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800 font-medium transition-all appearance-none">
                    <option value="" disabled>เลือกเกียร์</option>
                    {transmissionsList.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">เชื้อเพลิง</label>
                  <select required value={fuel} onChange={e => setFuel(e.target.value)} className="w-full bg-slate-50/50 border border-slate-200 px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800 font-medium transition-all appearance-none">
                    <option value="" disabled>เลือกเชื้อเพลิง</option>
                    {fuelsList.map(f => <option key={f} value={f}>{f}</option>)}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 md:gap-5">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">ภาษี (Tax)</label>
                  <input type="number" required value={tax} onChange={e => setTax(e.target.value)} placeholder="เช่น 145" className="w-full bg-slate-50/50 border border-slate-200 px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800 font-medium transition-all" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">กินน้ำมัน (MPG)</label>
                  <input type="number" step="0.1" required value={mpg} onChange={e => setMpg(e.target.value)} placeholder="เช่น 55.4" className="w-full bg-slate-50/50 border border-slate-200 px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800 font-medium transition-all" />
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100">
                <label className="block text-sm font-black text-slate-800 mb-2">ราคาที่ขายได้จริง (ปอนด์)</label>
                <div className="relative">
                  <input type="number" required min="0" value={actualPrice} onChange={e => setActualPrice(e.target.value)} className="w-full bg-slate-50/50 border border-slate-200 px-4 py-4 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-emerald-700 font-black text-xl pl-12 transition-all" placeholder="0" />
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xl">£</span>
                </div>
              </div>
              
              <div className="flex justify-end gap-3 mt-8 pt-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-6 py-3 rounded-xl text-slate-600 hover:bg-slate-100 font-bold transition-all active:scale-95 border border-transparent hover:border-slate-200">
                  ยกเลิก
                </button>
                <button type="submit" disabled={isSaving} className="px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-bold shadow-md shadow-blue-200 transition-all hover:shadow-lg active:scale-95 disabled:from-slate-400 disabled:to-slate-400 disabled:shadow-none">
                  {isSaving ? 'กำลังบันทึก...' : 'บันทึกข้อมูล'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}
    </div>
  );
}