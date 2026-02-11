import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

export async function GET(
  request: NextRequest,
  { params }: { params: { steamId: string } }
) {
  try {
    const { steamId } = params;

    const userResult = await sql`
      SELECT id, steam_id, username, avatar_url, rating, created_at
      FROM users
      WHERE steam_id = ${steamId};
    `;

    if (userResult.rows.length === 0) {
      return NextResponse.json({ error: 'Пользователь не найден' }, { status: 404 });
    }

    const user = userResult.rows[0];

    const statsResult = await sql`
      SELECT 
        COUNT(CASE WHEN status = 'completed' THEN 1 END)::int as completed_count,
        COUNT(CASE WHEN status = 'failed' THEN 1 END)::int as failed_count,
        COUNT(CASE WHEN status = 'active' THEN 1 END)::int as active_count
      FROM user_challenges
      WHERE user_id = ${user.id};
    `;

    const stats = statsResult.rows[0];

    const historyResult = await sql`
      SELECT 
        uc.id as record_id,
        c.text,
        c.difficulty,
        uc.status,
        uc.rating_change,
        uc.assigned_at,
        uc.completed_at
      FROM user_challenges uc
      JOIN challenges c ON c.id = uc.challenge_id
      WHERE uc.user_id = ${user.id}
      ORDER BY uc.assigned_at DESC;
    `;

    return NextResponse.json({
      profile: {
        steamId: user.steam_id,
        username: user.username,
        avatarUrl: user.avatar_url,
        rating: user.rating,
        createdAt: user.created_at,
        completedCount: stats.completed_count,
        failedCount: stats.failed_count,
        activeCount: stats.active_count,
      },
      challenges: historyResult.rows.map(row => ({
        recordId: row.record_id,
        text: row.text,
        difficulty: row.difficulty,
        status: row.status,
        ratingChange: row.rating_change,
        assignedAt: row.assigned_at,
        completedAt: row.completed_at,
      })),
    }, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        'CDN-Cache-Control': 'no-store',
        'Vercel-CDN-Cache-Control': 'no-store',
      },
    });
  } catch (error) {
    console.error('Profile error:', error);
    return NextResponse.json({ error: 'Ошибка сервера' }, { status: 500 });
  }
}
