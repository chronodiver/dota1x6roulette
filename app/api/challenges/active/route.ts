import { NextResponse } from 'next/server';
import { getIronSession } from 'iron-session';
import { cookies } from 'next/headers';
import { sessionOptions, SessionData } from '@/lib/session';
import { sql } from '@/lib/db';

export async function GET() {
    const session = await getIronSession<SessionData>(await cookies(), sessionOptions);

    if (!session.userId) {
        return NextResponse.json({ error: 'Необходимо войти через Steam' }, { status: 401 });
    }

    try {
        const result = await sql`
      SELECT 
        uc.id as record_id,
        c.text,
        c.difficulty,
        uc.rating_change as potential_rating,
        uc.assigned_at
      FROM user_challenges uc
      JOIN challenges c ON c.id = uc.challenge_id
      WHERE uc.user_id = ${session.userId} AND uc.status = 'active'
      ORDER BY uc.assigned_at DESC;
    `;

        return NextResponse.json({
            challenges: result.rows.map(row => ({
                recordId: row.record_id,
                text: row.text,
                difficulty: row.difficulty,
                potentialRating: row.potential_rating,
                assignedAt: row.assigned_at,
            })),
        });
    } catch (error) {
        console.error('Fetch active challenges error:', error);
        return NextResponse.json({ error: 'Ошибка сервера' }, { status: 500 });
    }
}
