import { NextRequest, NextResponse } from 'next/server';
import { getIronSession } from 'iron-session';
import { cookies } from 'next/headers';
import { sessionOptions, SessionData } from '@/lib/session';
import { sql } from '@/lib/db';

export async function POST(request: NextRequest) {
    const session = await getIronSession<SessionData>(await cookies(), sessionOptions);

    if (!session.userId) {
        return NextResponse.json({ error: 'Необходимо войти через Steam' }, { status: 401 });
    }

    try {
        const body = await request.json();
        const { recordId } = body;

        // Find the active challenge record
        const record = await sql`
      SELECT uc.id, uc.user_id, uc.rating_change, uc.status, c.text, c.difficulty
      FROM user_challenges uc
      JOIN challenges c ON c.id = uc.challenge_id
      WHERE uc.id = ${recordId} AND uc.user_id = ${session.userId} AND uc.status = 'active';
    `;

        if (record.rows.length === 0) {
            return NextResponse.json({ error: 'Активное задание не найдено' }, { status: 404 });
        }

        const challenge = record.rows[0];
        const ratingChange = challenge.rating_change;

        // Update challenge status
        await sql`
      UPDATE user_challenges 
      SET status = 'completed', completed_at = NOW()
      WHERE id = ${recordId};
    `;

        // Add rating to user
        await sql`
      UPDATE users 
      SET rating = rating + ${ratingChange}
      WHERE id = ${session.userId};
    `;

        // Fetch updated rating
        const userResult = await sql`
      SELECT rating FROM users WHERE id = ${session.userId};
    `;

        return NextResponse.json({
            success: true,
            ratingChange: ratingChange,
            newRating: userResult.rows[0].rating,
        });
    } catch (error) {
        console.error('Complete challenge error:', error);
        return NextResponse.json({ error: 'Ошибка сервера' }, { status: 500 });
    }
}
