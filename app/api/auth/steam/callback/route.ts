import { NextRequest, NextResponse } from 'next/server';
import { getIronSession } from 'iron-session';
import { cookies } from 'next/headers';
import { validateSteamLogin, getSteamProfile } from '@/lib/steam';
import { sql } from '@/lib/db';
import { sessionOptions, SessionData } from '@/lib/session';

export async function GET(request: NextRequest) {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

    try {
        const url = new URL(request.url);
        const params = url.searchParams;

        // Validate the OpenID response with Steam
        const steamId = await validateSteamLogin(params);
        if (!steamId) {
            return NextResponse.redirect(`${baseUrl}/?error=auth_failed`);
        }

        // Fetch Steam profile
        const profile = await getSteamProfile(steamId);
        if (!profile) {
            return NextResponse.redirect(`${baseUrl}/?error=profile_failed`);
        }

        // Upsert user in database
        const result = await sql`
      INSERT INTO users (steam_id, username, avatar_url)
      VALUES (${steamId}, ${profile.personaname}, ${profile.avatarfull})
      ON CONFLICT (steam_id) DO UPDATE SET
        username = ${profile.personaname},
        avatar_url = ${profile.avatarfull}
      RETURNING id, steam_id, username, avatar_url, rating;
    `;

        const user = result.rows[0];

        // Create session
        const session = await getIronSession<SessionData>(await cookies(), sessionOptions);
        session.userId = user.id;
        session.steamId = user.steam_id;
        session.username = user.username;
        session.avatarUrl = user.avatar_url;
        await session.save();

        return NextResponse.redirect(baseUrl);
    } catch (error) {
        console.error('Steam auth callback error:', error);
        return NextResponse.redirect(`${baseUrl}/?error=server_error`);
    }
}
