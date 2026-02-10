import { SessionOptions } from 'iron-session';

export interface SessionData {
    userId?: number;
    steamId?: string;
    username?: string;
    avatarUrl?: string;
}

export const sessionOptions: SessionOptions = {
    password: process.env.SESSION_SECRET || 'complex_password_at_least_32_characters_long_replace_me',
    cookieName: 'dota1x6_session',
    cookieOptions: {
        secure: process.env.NODE_ENV === 'production',
        httpOnly: true,
        sameSite: 'lax' as const,
        maxAge: 60 * 60 * 24 * 30, // 30 days
    },
};
