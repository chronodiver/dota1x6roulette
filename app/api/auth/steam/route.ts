import { NextRequest, NextResponse } from 'next/server';
import { getSteamLoginURL } from '@/lib/steam';

export async function GET(request: NextRequest) {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    const callbackUrl = `${baseUrl}/api/auth/steam/callback`;
    const steamLoginUrl = getSteamLoginURL(callbackUrl);

    return NextResponse.redirect(steamLoginUrl);
}
