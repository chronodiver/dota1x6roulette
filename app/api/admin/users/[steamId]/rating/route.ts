import { NextRequest, NextResponse } from 'next/server';
import { getIronSession } from 'iron-session';
import { cookies } from 'next/headers';
import { sessionOptions, SessionData } from '@/lib/session';
import { sql } from '@vercel/postgres';
import { isAdmin } from '@/lib/admin';

export async function PUT(
    request: NextRequest,
    { params }: { params: { steamId: string } }
) {
    const session = await getIronSession<SessionData>(await cookies(), sessionOptions);
    if (!session.steamId || !isAdmin(session.steamId)) {
        return NextResponse.json({ error: 'Доступ запрещён' }, { status: 403 });
    }

    try {
        const { steamId } = params;
        const { rating } = await request.json();

        if (typeof rating !== 'number') {
            return NextResponse.json({ error: 'Некорректный рейтинг' }, { status: 400 });
        }

        const result = await sql`
          UPDATE users SET rating = ${rating}
          WHERE steam_id = ${steamId}
          RETURNING id, steam_id, username, rating;
        `;

        if (result.rows.length === 0) {
            return NextResponse.json({ error: 'Пользователь не найден' }, { status: 404 });
        }

        return NextResponse.json({ success: true, user: result.rows[0] });
    } catch (error) {
        console.error('Admin update rating error:', error);
        return NextResponse.json({ error: 'Ошибка сервера' }, { status: 500 });
    }
}
