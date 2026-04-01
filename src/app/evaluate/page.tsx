  'use client';

  import { useState } from 'react';

  export default function Home() {
    const [formData, setFormData] = useState({
      brand: '',
      model: '',
      year: '',
      transmission: 'Auto',
      mileage: '',
      fuelType: 'Petrol',
      tax: '',        // เพิ่มใหม่
      mpg: '',        // เพิ่มใหม่
      engineSize: '', // เพิ่มใหม่
      phone: ''
    });

    const [resultPrice, setResultPrice] = useState<number | null>(null);
    const [aiPrice, setAiPrice] = useState<number | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      setIsLoading(true);
      setErrorMsg('');
      setResultPrice(null);
      setAiPrice(null); // เคลียร์ค่าเก่า

      // --- เช็คการล็อกอิน ---
      const userDataStr = localStorage.getItem('user');
      if (!userDataStr) {
        setErrorMsg('กรุณาเข้าสู่ระบบก่อนทำรายการครับ!');
        setIsLoading(false);
        return; // เตะกลับ ไม่ให้ทำรายการ
      }
      const userData = JSON.parse(userDataStr);
      // -------------------

      try {
        const response = await fetch('/api/valuation', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userId: userData.userId, // เอา ID ของคนที่ล็อกอินมาใช้จริงๆ!
            phone: formData.phone,
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

        // เซ็ตราคารับซื้อ (Seller เห็นแค่นี้)
        setResultPrice(data.displayedPrice ?? data.offered_price ?? 0);
        
        // ถ้าหลังบ้านส่ง aiPrice มาด้วย (แปลว่าเป็น Admin) ให้เซ็ตค่าไปโชว์
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
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center p-4">
        <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md">
          <h1 className="text-2xl font-bold text-center mb-6 text-gray-800">
            ระบบประเมินราคารถยนต์ (Full Specs)
          </h1>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* แบรนด์ & รุ่น */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">ยี่ห้อ (Brand)</label>
                <input type="text" name="brand" required className="mt-1 w-full p-2 border rounded-md text-black" onChange={handleChange} placeholder="เช่น Audi" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">รุ่น (Model)</label>
                <input type="text" name="model" required className="mt-1 w-full p-2 border rounded-md text-black" onChange={handleChange} placeholder="เช่น Q1" />
              </div>
            </div>

            {/* ปี & เลขไมล์ */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">ปี (Year)</label>
                <input type="number" name="year" required className="mt-1 w-full p-2 border rounded-md text-black" onChange={handleChange} placeholder="2020" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">เลขไมล์ (Mileage)</label>
                <input type="number" name="mileage" required className="mt-1 w-full p-2 border rounded-md text-black" onChange={handleChange} placeholder="50000" />
              </div>
            </div>

            {/* ภาษี, MPG, ขนาดเครื่อง (เพิ่มใหม่ตามโมเดล) */}
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 text-xs">ภาษี (Tax)</label>
                <input type="number" name="tax" required className="mt-1 w-full p-2 border rounded-md text-black" onChange={handleChange} placeholder="145" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 text-xs">MPG</label>
                <input type="number" step="0.1" name="mpg" required className="mt-1 w-full p-2 border rounded-md text-black" onChange={handleChange} placeholder="55.4" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 text-xs">เครื่องยนต์</label>
                <input type="number" step="0.1" name="engineSize" required className="mt-1 w-full p-2 border rounded-md text-black" onChange={handleChange} placeholder="1.6" />
              </div>
            </div>

            {/* เกียร์ & เชื้อเพลิง */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">เกียร์</label>
                <select name="transmission" className="mt-1 w-full p-2 border rounded-md text-black" onChange={handleChange}>
                  <option value="Manual">Manual</option>
                  <option value="Semi-Auto">Semi-Auto</option>
                  <option value="Automatic">Automatic</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">เชื้อเพลิง</label>
                <select name="fuelType" className="mt-1 w-full p-2 border rounded-md text-black" onChange={handleChange}>
                  <option value="Petrol">Petrol</option>
                  <option value="Diesel">Diesel</option>
                  <option value="Hybrid">Hybrid</option>
                  <option value="Electric">Electric</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>

            {/* เบอร์โทรศัพท์ */}
            <div>
              <label className="block text-sm font-medium text-gray-700">เบอร์ติดต่อกลับ</label>
              <input type="text" name="phone" required className="mt-1 w-full p-2 border rounded-md text-black" onChange={handleChange} placeholder="08X-XXX-XXXX" />
            </div>

            <button 
              type="submit" 
              disabled={isLoading}
              className="w-full bg-blue-600 text-white font-bold py-3 px-4 rounded-md hover:bg-blue-700 transition duration-200 disabled:bg-gray-400"
            >
              {isLoading ? 'กำลังวิเคราะห์ด้วย AI...' : 'เช็คราคารับซื้อเลย!'}
            </button>
          </form>

          {errorMsg && (
            <div className="mt-4 p-3 bg-red-100 text-red-700 rounded-md text-center text-sm">
              {errorMsg}
            </div>
          )}

          {/* กล่องแสดงราคารับซื้อ (เห็นทุกคน) */}
          {resultPrice !== null && (
            <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-md text-center">
              <h2 className="text-sm text-green-800 font-semibold mb-1">ราคารับซื้อเสนอให้ลูกค้า</h2>
              <p className="text-3xl font-bold text-green-600">
                ฿{resultPrice.toLocaleString()}
              </p>
            </div>
          )}

          {/* กล่องแสดงราคาประเมิน AI แท้ๆ (เห็นเฉพาะ ADMIN) */}
          {aiPrice !== null && (
            <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-md text-center">
              <h2 className="text-sm text-blue-800 font-semibold mb-1">👑 ต้นทุนคาดการณ์ (Admin Only)</h2>
              <p className="text-2xl font-bold text-blue-600">
                ฿{aiPrice.toLocaleString()}
              </p>
              <p className="text-xs text-gray-500 mt-2">*ราคาประเมินตรงจาก AI ML_Pipeline</p>
            </div>
          )}
        </div>
      </div>
    );
  }