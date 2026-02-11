import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
    try {
        const url = new URL(request.url);
        const limit = Math.min(parseInt(url.searchParams.get('limit') || '100'), 100);

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
      LIMIT ${limit};
    `;

        const response = NextResponse.json({
            leaderboard: result.rows.map((row, index) => ({
                rank: index + 1,
                steamId: row.steam_id,
                username: row.username,
                avatarUrl: row.avatar_url,
                rating: row.rating,
                completedCount: row.completed_count,
                failedCount: row.failed_count,
            })),
        });
        response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate');
        return response;
    } catch (error) {
        console.error('Leaderboard error:', error);
        return NextResponse.json({ error: 'Ошибка сервера' }, { status: 500 });
    }
}
