import { NextResponse } from 'next/server';
import { initDB } from '@/lib/db';
import { sql } from '@vercel/postgres';
import { challenges } from '@/lib/challenges';

export async function POST() {
    try {
        // Create tables
        await initDB();

        // Seed challenges
        for (const challenge of challenges) {
            await sql`
        INSERT INTO challenges (id, text, difficulty)
        VALUES (${challenge.id}, ${challenge.text}, ${challenge.difficulty})
        ON CONFLICT (id) DO UPDATE SET
          text = ${challenge.text},
          difficulty = ${challenge.difficulty};
      `;
        }

        // Reset sequence to be after max id
        await sql`SELECT setval('challenges_id_seq', (SELECT MAX(id) FROM challenges));`;

        return NextResponse.json({ success: true, message: 'Database initialized and challenges seeded' });
    } catch (error) {
        console.error('Init DB error:', error);
        return NextResponse.json({ error: String(error) }, { status: 500 });
    }
}
