'use client';
import { useEffect, useState } from 'react';

export default function AdminUserList() {
    const [users, setUsers] = useState([]);

    useEffect(() => {
        // ดึงข้อมูลผู้ใช้ (ควรสร้าง API Route รองรับด้วย)
        fetch('/api/admin/users')
            .then(res => res.json())
            .then(data => setUsers(data.users));
    }, []);

    return (
        <div className="p-8 bg-white min-h-screen text-black">
            <h1 className="text-2xl font-bold mb-6">รายชื่อผู้สมัครสมาชิก (Sellers)</h1>
            <table className="w-full border-collapse border border-gray-200">
                <thead>
                    <tr className="bg-gray-100">
                        <th className="border p-2">Username</th>
                        <th className="border p-2">เบอร์โทร</th>
                        <th className="border p-2">จำนวนรายการประเมิน</th>
                    </tr>
                </thead>
                <tbody>
                    {users.map((u: any) => (
                        <tr key={u.id} className="hover:bg-gray-50 cursor-pointer">
                            <td className="border p-2 text-center">{u.username}</td>
                            <td className="border p-2 text-center">{u.phone}</td>
                            <td className="border p-2 text-center">{u._count?.leads || 0} รายการ</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}