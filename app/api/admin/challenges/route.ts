import { NextRequest, NextResponse } from 'next/server';
import { getIronSession } from 'iron-session';
import { cookies } from 'next/headers';
import { sessionOptions, SessionData } from '@/lib/session';
import { sql } from '@vercel/postgres';
import { isAdmin } from '@/lib/admin';

export async function POST(request: NextRequest) {
    const session = await getIronSession<SessionData>(await cookies(), sessionOptions);
    if (!session.steamId || !isAdmin(session.steamId)) {
        return NextResponse.json({ error: 'Доступ запрещён' }, { status: 403 });
    }

    try {
        const { text, difficulty } = await request.json();

        if (!text || !['easy', 'normal', 'hard', 'insane'].includes(difficulty)) {
            return NextResponse.json({ error: 'Некорректные данные' }, { status: 400 });
        }

        const result = await sql`
          INSERT INTO challenges (text, difficulty)
          VALUES (${text}, ${difficulty})
          RETURNING id, text, difficulty;
        `;

        return NextResponse.json({ success: true, challenge: result.rows[0] });
    } catch (error) {
        console.error('Admin add challenge error:', error);
        return NextResponse.json({ error: 'Ошибка сервера' }, { status: 500 });
    }
}
