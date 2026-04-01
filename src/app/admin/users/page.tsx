'use client';
import { useEffect, useState } from 'react';

export default function AdminUsersPage() {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    // พี่ต้องสร้าง API /api/admin/users เพื่อดึงรายชื่อ user ทั้งหมดด้วยนะครับ
    fetch('/api/admin/users')
      .then(res => res.json())
      .then(data => setUsers(data.users || []));
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6 text-black">รายชื่อผู้ขายทั้งหมด</h1>
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full text-left text-black">
          <thead className="bg-gray-100 border-b">
            <tr>
              <th className="p-4">Username</th>
              <th className="p-4">เบอร์โทรศัพท์</th>
              <th className="p-4">Role</th>
              <th className="p-4">Action</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user: any) => (
              <tr key={user.id} className="border-b hover:bg-gray-50">
                <td className="p-4">{user.username}</td>
                <td className="p-4">{user.phone}</td>
                <td className="p-4">
                  <span className={`px-2 py-1 rounded text-xs ${user.role === 'ADMIN' ? 'bg-purple-100 text-purple-700' : 'bg-green-100 text-green-700'}`}>
                    {user.role}
                  </span>
                </td>
                <td className="p-4">
                  <button className="text-blue-600 hover:underline">ดูข้อมูล</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}