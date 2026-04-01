import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs'; // npm install bcryptjs

export class AuthService {
    static async registerUser(data: any) {
        const hashedPassword = await bcrypt.hash(data.password, 10);
        return await prisma.user.create({
            data: {
                username: data.username,
                phone: data.phone,
                password_hash: hashedPassword,
                role: 'SELLER' // ค่าเริ่มต้นเป็นคนขาย
            }
        });
    }

    static async authenticateUser(credentials: any) {
        const user = await prisma.user.findUnique({ where: { username: credentials.username } });
        if (!user) throw new Error("ไม่พบผู้ใช้งานนี้");

        const isValid = await bcrypt.compare(credentials.password, user.password_hash);
        if (!isValid) throw new Error("รหัสผ่านไม่ถูกต้อง");
        
        return user;
    }
}