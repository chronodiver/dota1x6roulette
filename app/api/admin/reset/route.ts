import { NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';

export const dynamic = 'force-dynamic';

export async function POST() {
    try {
        await sql`DELETE FROM user_challenges;`;
        await sql`UPDATE users SET rating = 0;`;

        const result = await sql`SELECT id, username, rating FROM users;`;

        return NextResponse.json({
            success: true,
            message: 'All challenges deleted, all ratings reset to 0',
            users: result.rows,
        });
    } catch (error) {
        console.error('Reset error:', error);
        return NextResponse.json({ error: String(error) }, { status: 500 });
    }
}
