import { NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const users = await sql`SELECT id, username, rating FROM users;`;
        const challengeCount = await sql`SELECT COUNT(*) as cnt FROM user_challenges;`;
        const leaderboard = await sql`
      SELECT 
        u.steam_id,
        u.username,
        u.rating,
        COUNT(CASE WHEN uc.status = 'completed' THEN 1 END)::int as completed_count,
        COUNT(CASE WHEN uc.status = 'failed' THEN 1 END)::int as failed_count
      FROM users u
      LEFT JOIN user_challenges uc ON uc.user_id = u.id
      GROUP BY u.id, u.steam_id, u.username, u.rating
      HAVING COUNT(uc.id) > 0
      ORDER BY u.rating DESC;
    `;

        return NextResponse.json({
            timestamp: new Date().toISOString(),
            users: users.rows,
            totalChallenges: challengeCount.rows[0].cnt,
            leaderboardResult: leaderboard.rows,
        });
    } catch (error) {
        return NextResponse.json({ error: String(error) }, { status: 500 });
    }
}
