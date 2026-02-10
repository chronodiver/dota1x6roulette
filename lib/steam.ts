const STEAM_OPENID_URL = 'https://steamcommunity.com/openid/login';

export function getSteamLoginURL(returnTo: string): string {
    const params = new URLSearchParams({
        'openid.ns': 'http://specs.openid.net/auth/2.0',
        'openid.mode': 'checkid_setup',
        'openid.return_to': returnTo,
        'openid.realm': new URL(returnTo).origin,
        'openid.identity': 'http://specs.openid.net/auth/2.0/identifier_select',
        'openid.claimed_id': 'http://specs.openid.net/auth/2.0/identifier_select',
    });
    return `${STEAM_OPENID_URL}?${params.toString()}`;
}

export async function validateSteamLogin(params: URLSearchParams): Promise<string | null> {
    // Change mode to check_authentication for verification
    const verifyParams = new URLSearchParams(params);
    verifyParams.set('openid.mode', 'check_authentication');

    const response = await fetch(STEAM_OPENID_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: verifyParams.toString(),
    });

    const text = await response.text();

    if (!text.includes('is_valid:true')) {
        return null;
    }

    // Extract Steam ID from claimed_id
    const claimedId = params.get('openid.claimed_id');
    if (!claimedId) return null;

    const match = claimedId.match(/\/id\/(\d+)$/) || claimedId.match(/\/(\d+)$/);
    if (!match) return null;

    return match[1];
}

export interface SteamProfile {
    steamid: string;
    personaname: string;
    avatarfull: string;
    avatar: string;
    avatarmedium: string;
}

export async function getSteamProfile(steamId: string): Promise<SteamProfile | null> {
    const apiKey = process.env.STEAM_API_KEY;
    if (!apiKey) {
        console.error('STEAM_API_KEY is not set');
        return null;
    }

    const url = `https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v2/?key=${apiKey}&steamids=${steamId}`;
    const response = await fetch(url);
    const data = await response.json();

    const players = data?.response?.players;
    if (!players || players.length === 0) return null;

    return players[0] as SteamProfile;
}
