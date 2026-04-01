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
  // เพิ่ม State ใหม่ 2 ตัว
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
    
    // ยัด tax กับ mpg เข้าไปใน JSON ด้วย
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
        // ล้างข้อมูลฟอร์มให้เกลี้ยง
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
          <div className="font-bold text-gray-800">{obj.brand || ''} {obj.model || ''} {obj.year ? `(${obj.year})` : ''}</div>
          <div className="text-xs text-gray-500 mt-1">{details}</div>
        </div>
      );
    } catch { return specsStr; }
  };

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6 border-b pb-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">ข้อมูลการขาย (Sales Dataset)</h1>
          <p className="text-gray-500 text-sm mt-1">ข้อมูลทั้งหมด {sales.length} รายการสำหรับใช้ Retrain AI</p>
        </div>
        <div className="flex space-x-3">
          <button 
            onClick={handleRetrain}
            disabled={isRetraining || sales.length === 0}
            className={`px-5 py-2.5 rounded-md font-semibold shadow-sm transition-colors flex items-center ${
              isRetraining ? 'bg-gray-400' : 'bg-amber-500 hover:bg-amber-600 text-white'
            }`}
          >
            <svg className={`w-5 h-5 mr-2 ${isRetraining ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
            </svg>
            {isRetraining ? 'กำลังส่งข้อมูล...' : 'เทรนข้อมูล'}
          </button>

          <button 
            onClick={() => setIsModalOpen(true)}
            className="bg-blue-600 text-white px-5 py-2.5 rounded-md hover:bg-blue-700 shadow-sm font-semibold transition-colors"
          >
            + เพิ่มเติมการขาย
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden text-gray-900">
        <table className="w-full text-left">
          <thead className="bg-gray-50">
            <tr>
              <th className="p-4 border-b">วันที่ขาย</th>
              <th className="p-4 border-b w-1/2">รายละเอียดรถ</th>
              <th className="p-4 border-b">ราคาขายจริง (ปอนด์)</th>
            </tr>
          </thead>
          <tbody>
            {sales.length === 0 ? (
              <tr><td colSpan={3} className="p-8 text-center text-gray-500">ยังไม่มีข้อมูลในระบบ</td></tr>
            ) : (
              sales.map((sale: any) => (
                <tr key={sale.id} className="border-b hover:bg-gray-50 transition-colors">
                  <td className="p-4 align-top whitespace-nowrap">{new Date(sale.sold_at).toLocaleDateString('th-TH')}</td>
                  <td className="p-4 align-top">{parseSpecs(sale.car_specs)}</td>
                  <td className="p-4 text-green-600 font-bold align-top whitespace-nowrap">£ {sale.actual_sale_price.toLocaleString()}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-5 text-gray-800 border-b pb-3">เพิ่มข้อมูลการขายใหม่</h2>
            <form onSubmit={handleAddManualSale} className="space-y-4">
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">ยี่ห้อ (Brand)</label>
                  <select required value={brand} onChange={handleBrandChange} className="w-full border p-2 rounded-md focus:ring-2 focus:ring-blue-500 outline-none bg-white text-gray-900">
                    <option value="" disabled>เลือกยี่ห้อ</option>
                    {brandsList.map(b => <option key={b} value={b}>{b}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">รุ่น (Model)</label>
                  <select required value={model} onChange={e => setModel(e.target.value)} disabled={!brand || modelsList.length === 0} className="w-full border p-2 rounded-md focus:ring-2 focus:ring-blue-500 outline-none bg-white disabled:bg-gray-100 text-gray-900">
                    <option value="" disabled>
                      {!brand ? 'กรุณาเลือกยี่ห้อก่อน' : (modelsList.length === 0 ? 'กำลังโหลดรุ่น...' : 'เลือกรุ่น')}
                    </option>
                    {modelsList.map((m: string) => <option key={m} value={m}>{m}</option>)}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">ปีที่ผลิต (Year)</label>
                  <input type="number" required min="1990" max={new Date().getFullYear()} value={year} onChange={e => setYear(e.target.value)} placeholder="เช่น 2019" className="w-full border p-2 rounded-md focus:ring-2 focus:ring-blue-500 outline-none text-gray-900" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">เครื่องยนต์ (Engine)</label>
                  <input type="number" step="0.1" required value={engineSize} onChange={e => setEngineSize(e.target.value)} placeholder="เช่น 1.5" className="w-full border p-2 rounded-md focus:ring-2 focus:ring-blue-500 outline-none text-gray-900" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">เลขไมล์ (Mileage)</label>
                  <input type="number" required min="0" value={mileage} onChange={e => setMileage(e.target.value)} placeholder="เช่น 50000" className="w-full border p-2 rounded-md focus:ring-2 focus:ring-blue-500 outline-none text-gray-900" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">ระบบเกียร์ (Transmission)</label>
                  <select required value={transmission} onChange={e => setTransmission(e.target.value)} className="w-full border p-2 rounded-md focus:ring-2 focus:ring-blue-500 outline-none bg-white text-gray-900">
                    <option value="" disabled>เลือกเกียร์</option>
                    {transmissionsList.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">เชื้อเพลิง (Fuel)</label>
                  <select required value={fuel} onChange={e => setFuel(e.target.value)} className="w-full border p-2 rounded-md focus:ring-2 focus:ring-blue-500 outline-none bg-white text-gray-900">
                    <option value="" disabled>เลือกเชื้อเพลิง</option>
                    {fuelsList.map(f => <option key={f} value={f}>{f}</option>)}
                  </select>
                </div>
              </div>

              {/* เพิ่ม Grid ใหม่สำหรับ Tax และ MPG */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">ภาษี (Tax)</label>
                  <input type="number" required value={tax} onChange={e => setTax(e.target.value)} placeholder="เช่น 145" className="w-full border p-2 rounded-md focus:ring-2 focus:ring-blue-500 outline-none text-gray-900" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">อัตราสิ้นเปลือง (MPG)</label>
                  <input type="number" step="0.1" required value={mpg} onChange={e => setMpg(e.target.value)} placeholder="เช่น 55.4" className="w-full border p-2 rounded-md focus:ring-2 focus:ring-blue-500 outline-none text-gray-900" />
                </div>
              </div>

              <div className="pt-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">ราคาที่ขายได้จริง (ปอนด์)</label>
                <div className="relative">
                  <input type="number" required min="0" value={actualPrice} onChange={e => setActualPrice(e.target.value)} className="w-full border p-2 rounded-md focus:ring-2 focus:ring-blue-500 outline-none pl-8 font-bold text-green-700" />
                  <span className="absolute left-3 top-2 text-gray-500 font-bold">£</span>
                </div>
              </div>
              
              <div className="flex justify-end space-x-3 mt-8 pt-4 border-t">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 border rounded-md text-gray-600 hover:bg-gray-100 font-medium transition-colors">
                  ยกเลิก
                </button>
                <button type="submit" disabled={isSaving} className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium transition-colors disabled:bg-gray-400">
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