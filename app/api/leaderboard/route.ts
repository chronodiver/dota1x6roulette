import { NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

export async function GET() {
    try {
        const result = await sql`
          SELECT 
            u.steam_id,
            u.username,
            u.avatar_url,
            u.rating,
            COUNT(CASE WHEN uc.status = 'completed' THEN 1 END)::int as completed_count,
            COUNT(CASE WHEN uc.status = 'failed' THEN 1 END)::int as failed_count
          FROM users u
          LEFT JOIN user_challenges uc ON uc.user_id = u.id
          GROUP BY u.id, u.steam_id, u.username, u.avatar_url, u.rating
          HAVING COUNT(uc.id) > 0
          ORDER BY u.rating DESC
          LIMIT 100;
        `;

        return NextResponse.json({
            leaderboard: result.rows.map((row, index) => ({
                rank: index + 1,
                steamId: row.steam_id,
                username: row.username,
                avatarUrl: row.avatar_url,
                rating: row.rating,
                completedCount: row.completed_count,
                failedCount: row.failed_count,
            })),
        }, {
            headers: {
                'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
                'CDN-Cache-Control': 'no-store',
                'Vercel-CDN-Cache-Control': 'no-store',
            },
        });
    } catch (error) {
        console.error('Leaderboard error:', error);
        return NextResponse.json({ error: 'Ошибка сервера' }, { status: 500 });
    }
}
