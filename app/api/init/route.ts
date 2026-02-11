import { NextResponse } from 'next/server';
import { initDB } from '@/lib/db';

export async function POST() {
    try {
        // Create tables
        await initDB();

        return NextResponse.json({ success: true, message: 'Database initialized' });
    } catch (error) {
        console.error('Init DB error:', error);
        return NextResponse.json({ error: String(error) }, { status: 500 });
    }
}
