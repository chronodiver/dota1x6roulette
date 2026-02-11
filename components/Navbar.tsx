'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { TrophyIcon, UserIcon, SettingsIcon, LogoutIcon, StarIcon, SteamIcon } from '@/components/Icons';

interface User {
    username: string;
    avatar_url: string;
    steam_id: string;
    rating: number;
    isAdmin?: boolean;
}

export default function Navbar() {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    useEffect(() => {
        fetch('/api/me', { cache: 'no-store' })
            .then(res => res.json())
            .then(data => { setUser(data.user || null); setLoading(false); })
            .catch(() => setLoading(false));
    }, []);

    return (
        <nav className="navbar">
            <div className="navbar-inner">
                <Link href="/" className="navbar-logo">
                    DOTA <span className="highlight">1x6</span>
                </Link>

                <button className="mobile-menu-btn" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
                    <span></span><span></span><span></span>
                </button>

                <div className={`navbar-links ${mobileMenuOpen ? 'open' : ''}`}>
                    <Link href="/leaderboard" className="nav-link" onClick={() => setMobileMenuOpen(false)}>
                        <TrophyIcon size={16} /> Рейтинг
                    </Link>

                    {user?.isAdmin && (
                        <Link href="/admin" className="nav-link admin-link" onClick={() => setMobileMenuOpen(false)}>
                            <SettingsIcon size={16} /> Админ
                        </Link>
                    )}

                    {!loading && (
                        user ? (
                            <div className="navbar-user">
                                <Link href={`/profile/${user.steam_id}`} className="nav-link" onClick={() => setMobileMenuOpen(false)}>
                                    <img src={user.avatar_url} alt="" className="navbar-avatar" />
                                    <span className="navbar-username">{user.username}</span>
                                </Link>
                                <span className="navbar-rating">
                                    <StarIcon size={14} /> {user.rating}
                                </span>
                                <a href="/api/auth/logout" className="nav-link logout-link" onClick={() => setMobileMenuOpen(false)}>
                                    <LogoutIcon size={14} /> Выход
                                </a>
                            </div>
                        ) : (
                            <a href="/api/auth/steam" className="steam-login-btn" onClick={() => setMobileMenuOpen(false)}>
                                <SteamIcon size={18} /> Войти через Steam
                            </a>
                        )
                    )}
                </div>
            </div>
        </nav>
    );
}
