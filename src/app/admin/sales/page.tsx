'use client';
import { useEffect, useState } from 'react';

export default function AdminSalesPage() {
  const [leads, setLeads] = useState([]);

  useEffect(() => {
    fetch('/api/admin/leads').then(res => res.json()).then(data => setLeads(data.leads || []));
  }, []);

  const handleConfirmSale = async (leadId: string) => {
    const actualPrice = prompt("กรุณาระบุราคาที่ขายได้จริง (บาท):");
    if (!actualPrice) return;

    const res = await fetch('/api/admin/sales/confirm', {
      method: 'POST',
      body: JSON.stringify({ leadId, actualPrice: Number(actualPrice) })
    });

    if (res.ok) {
      alert("บันทึกการขายสำเร็จ! ข้อมูลถูกส่งไปยัง Dataset แล้ว");
      window.location.reload();
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6 text-black">รายการที่รอดำเนินการ (Sales Leads)</h1>
      <div className="grid gap-4">
        {leads.map((lead: any) => (
          <div key={lead.id} className="bg-white p-4 rounded-lg shadow border-l-4 border-blue-500 flex justify-between items-center text-black">
            <div>
              <p className="font-bold">{JSON.parse(lead.car_specs).brand} {JSON.parse(lead.car_specs).model}</p>
              <p className="text-sm text-gray-500">ผู้ประเมิน: {lead.user.username} | เบอร์: {lead.phone}</p>
              <p className="text-sm">ราคา AI: ฿{lead.ai_price.toLocaleString()} | เสนอซื้อ: ฿{lead.offered_price.toLocaleString()}</p>
            </div>
            <button onClick={() => handleConfirmSale(lead.id)} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
              บันทึกการขายจริง
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}