import { NextResponse } from 'next/server';
import { getIronSession } from 'iron-session';
import { cookies } from 'next/headers';
import { sessionOptions, SessionData } from '@/lib/session';
import { sql } from '@vercel/postgres';
import { isAdmin } from '@/lib/admin';

export const dynamic = 'force-dynamic';

export async function GET() {
    const session = await getIronSession<SessionData>(await cookies(), sessionOptions);

    if (!session.userId) {
        return NextResponse.json({ user: null });
    }

    try {
        const result = await sql`
          SELECT id, steam_id, username, avatar_url, rating
          FROM users WHERE id = ${session.userId};
        `;

        if (result.rows.length === 0) {
            return NextResponse.json({ user: null });
        }

        const row = result.rows[0];
        return NextResponse.json({
            user: {
                id: row.id,
                steamId: row.steam_id,
                username: row.username,
                avatarUrl: row.avatar_url,
                rating: row.rating,
                isAdmin: isAdmin(row.steam_id),
            },
        });
    } catch (error) {
        console.error('Me error:', error);
        return NextResponse.json({ user: null });
    }
}
