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
      SELECT uc.id, uc.user_id, uc.rating_change, uc.status
      FROM user_challenges uc
      WHERE uc.id = ${recordId} AND uc.user_id = ${session.userId} AND uc.status = 'active';
    `;

        if (record.rows.length === 0) {
            return NextResponse.json({ error: 'Активное задание не найдено' }, { status: 404 });
        }

        const challenge = record.rows[0];
        const ratingPenalty = challenge.rating_change; // same value but subtracted

        // Update challenge status and store negative rating change
        await sql`
      UPDATE user_challenges 
      SET status = 'failed', rating_change = ${-ratingPenalty}, completed_at = NOW()
      WHERE id = ${recordId};
    `;

        // Subtract rating from user
        await sql`
      UPDATE users 
      SET rating = rating - ${ratingPenalty}
      WHERE id = ${session.userId};
    `;

        // Fetch updated rating
        const userResult = await sql`
      SELECT rating FROM users WHERE id = ${session.userId};
    `;

        return NextResponse.json({
            success: true,
            ratingChange: -ratingPenalty,
            newRating: userResult.rows[0].rating,
        });
    } catch (error) {
        console.error('Fail challenge error:', error);
        return NextResponse.json({ error: 'Ошибка сервера' }, { status: 500 });
    }
}
