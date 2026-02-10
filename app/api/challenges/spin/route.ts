import { NextRequest, NextResponse } from 'next/server';
import { getIronSession } from 'iron-session';
import { cookies } from 'next/headers';
import { sessionOptions, SessionData } from '@/lib/session';
import { sql } from '@/lib/db';
import { challenges, RATING_REWARDS } from '@/lib/challenges';

export async function POST(request: NextRequest) {
    const session = await getIronSession<SessionData>(await cookies(), sessionOptions);

    if (!session.userId) {
        return NextResponse.json({ error: 'Необходимо войти через Steam' }, { status: 401 });
    }

    try {
        const body = await request.json();
        const { challengeId } = body;

        // Validate challenge exists
        const challenge = challenges.find(c => c.id === challengeId);
        if (!challenge) {
            return NextResponse.json({ error: 'Задание не найдено' }, { status: 400 });
        }

        // Ensure challenge exists in DB
        await sql`
      INSERT INTO challenges (id, text, difficulty)
      VALUES (${challenge.id}, ${challenge.text}, ${challenge.difficulty})
      ON CONFLICT (id) DO UPDATE SET
        text = ${challenge.text},
        difficulty = ${challenge.difficulty};
    `;

        const ratingReward = RATING_REWARDS[challenge.difficulty];

        // Create user_challenge record
        const result = await sql`
      INSERT INTO user_challenges (user_id, challenge_id, status, rating_change)
      VALUES (${session.userId}, ${challenge.id}, 'active', ${ratingReward})
      RETURNING id, status, rating_change, assigned_at;
    `;

        const record = result.rows[0];

        return NextResponse.json({
            success: true,
            challenge: {
                recordId: record.id,
                text: challenge.text,
                difficulty: challenge.difficulty,
                potentialRating: ratingReward,
                assignedAt: record.assigned_at,
            },
        });
    } catch (error) {
        console.error('Spin error:', error);
        return NextResponse.json({ error: 'Ошибка сервера' }, { status: 500 });
    }
}
