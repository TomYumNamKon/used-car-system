import { AuthService } from '@/services/AuthService';
import { NextResponse } from 'next/server';

export class AuthController {
    static async register(request: Request) {
        try {
            const body = await request.json();
            const user = await AuthService.registerUser(body);
            return NextResponse.json({ success: true, userId: user.id });
        } catch (error: any) {
            return NextResponse.json({ error: error.message }, { status: 400 });
        }
    }

    static async login(request: Request) {
        try {
            const body = await request.json();
            const user = await AuthService.authenticateUser(body);
            // ปกติจะออก JWT Token ที่นี่
            return NextResponse.json({ success: true, role: user.role });
        } catch (error: any) {
            return NextResponse.json({ error: error.message }, { status: 401 });
        }
    }
}