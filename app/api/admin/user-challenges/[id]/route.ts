import { NextRequest, NextResponse } from 'next/server';
import { getIronSession } from 'iron-session';
import { cookies } from 'next/headers';
import { sessionOptions, SessionData } from '@/lib/session';
import { sql } from '@vercel/postgres';
import { isAdmin } from '@/lib/admin';

export async function DELETE(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    const session = await getIronSession<SessionData>(await cookies(), sessionOptions);
    if (!session.steamId || !isAdmin(session.steamId)) {
        return NextResponse.json({ error: 'Доступ запрещён' }, { status: 403 });
    }

    try {
        const recordId = parseInt(params.id);

        // Get the challenge record to know the rating change
        const record = await sql`
          SELECT uc.id, uc.user_id, uc.status, uc.rating_change
          FROM user_challenges uc
          WHERE uc.id = ${recordId};
        `;

        if (record.rows.length === 0) {
            return NextResponse.json({ error: 'Запись не найдена' }, { status: 404 });
        }

        const { user_id, status, rating_change } = record.rows[0];

        // Rollback rating if the challenge was completed or failed
        if (status === 'completed') {
            await sql`UPDATE users SET rating = rating - ${rating_change} WHERE id = ${user_id};`;
        } else if (status === 'failed') {
            await sql`UPDATE users SET rating = rating + ${Math.abs(rating_change)} WHERE id = ${user_id};`;
        }

        // Delete the record
        await sql`DELETE FROM user_challenges WHERE id = ${recordId};`;

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Admin delete user challenge error:', error);
        return NextResponse.json({ error: 'Ошибка сервера' }, { status: 500 });
    }
}
