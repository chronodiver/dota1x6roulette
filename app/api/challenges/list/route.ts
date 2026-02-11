import { NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

export async function GET() {
    try {
        const result = await sql`
          SELECT id, text, difficulty
          FROM challenges
          ORDER BY id ASC;
        `;

        return NextResponse.json({
            challenges: result.rows,
        }, {
            headers: {
                'Cache-Control': 'no-store, no-cache, must-revalidate',
                'Vercel-CDN-Cache-Control': 'no-store',
            },
        });
    } catch (error) {
        console.error('Challenges list error:', error);
        return NextResponse.json({ error: 'Ошибка сервера' }, { status: 500 });
    }
}
