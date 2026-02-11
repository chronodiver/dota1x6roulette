import { NextResponse } from 'next/server';
import { getIronSession } from 'iron-session';
import { cookies } from 'next/headers';
import { sessionOptions, SessionData } from '@/lib/session';
import { sql } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
    const session = await getIronSession<SessionData>(await cookies(), sessionOptions);

    if (!session.userId) {
        return NextResponse.json({ user: null });
    }

    // Fetch fresh data from DB
    const result = await sql`
    SELECT id, steam_id, username, avatar_url, rating 
    FROM users 
    WHERE id = ${session.userId};
  `;

    if (result.rows.length === 0) {
        session.destroy();
        return NextResponse.json({ user: null });
    }

    const user = result.rows[0];
    return NextResponse.json({
        user: {
            id: user.id,
            steamId: user.steam_id,
            username: user.username,
            avatarUrl: user.avatar_url,
            rating: user.rating,
        },
    });
}
