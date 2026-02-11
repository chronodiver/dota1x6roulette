import { NextRequest, NextResponse } from 'next/server';
import { getIronSession } from 'iron-session';
import { cookies } from 'next/headers';
import { sessionOptions, SessionData } from '@/lib/session';
import { sql } from '@vercel/postgres';
import { isAdmin } from '@/lib/admin';

export async function PUT(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    const session = await getIronSession<SessionData>(await cookies(), sessionOptions);
    if (!session.steamId || !isAdmin(session.steamId)) {
        return NextResponse.json({ error: 'Доступ запрещён' }, { status: 403 });
    }

    try {
        const challengeId = parseInt(params.id);
        const { text, difficulty } = await request.json();

        if (!text || !['easy', 'normal', 'hard', 'insane'].includes(difficulty)) {
            return NextResponse.json({ error: 'Некорректные данные' }, { status: 400 });
        }

        const result = await sql`
          UPDATE challenges
          SET text = ${text}, difficulty = ${difficulty}
          WHERE id = ${challengeId}
          RETURNING id, text, difficulty;
        `;

        if (result.rows.length === 0) {
            return NextResponse.json({ error: 'Челлендж не найден' }, { status: 404 });
        }

        return NextResponse.json({ success: true, challenge: result.rows[0] });
    } catch (error) {
        console.error('Admin update challenge error:', error);
        return NextResponse.json({ error: 'Ошибка сервера' }, { status: 500 });
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    const session = await getIronSession<SessionData>(await cookies(), sessionOptions);
    if (!session.steamId || !isAdmin(session.steamId)) {
        return NextResponse.json({ error: 'Доступ запрещён' }, { status: 403 });
    }

    try {
        const challengeId = parseInt(params.id);

        await sql`DELETE FROM challenges WHERE id = ${challengeId};`;

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Admin delete challenge error:', error);
        return NextResponse.json({ error: 'Ошибка сервера' }, { status: 500 });
    }
}
