'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface User {
    id: number;
    steamId: string;
    username: string;
    avatarUrl: string;
    rating: number;
}

export default function Navbar() {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    useEffect(() => {
        fetch('/api/me')
            .then(res => res.json())
            .then(data => {
                setUser(data.user);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, []);

    return (
        <nav className="navbar">
            <div className="navbar-inner">
                <Link href="/" className="navbar-logo">
                    DOTA 1x6 <span className="highlight">Challenge</span>
                </Link>

                <button
                    className="mobile-menu-btn"
                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                    aria-label="Toggle menu"
                >
                    <span></span>
                    <span></span>
                    <span></span>
                </button>

                <div className={`navbar-links ${mobileMenuOpen ? 'open' : ''}`}>
                    <Link href="/" className="nav-link" onClick={() => setMobileMenuOpen(false)}>
                        🎰 Рулетка
                    </Link>
                    <Link href="/leaderboard" className="nav-link" onClick={() => setMobileMenuOpen(false)}>
                        🏆 Топ
                    </Link>
                    {!loading && (
                        <>
                            {user ? (
                                <>
                                    <Link
                                        href={`/profile/${user.steamId}`}
                                        className="nav-link"
                                        onClick={() => setMobileMenuOpen(false)}
                                    >
                                        👤 Профиль
                                    </Link>
                                    <div className="navbar-user">
                                        <img src={user.avatarUrl} alt={user.username} className="navbar-avatar" />
                                        <span className="navbar-username">{user.username}</span>
                                        <span className="navbar-rating">⭐ {user.rating}</span>
                                        <a href="/api/auth/logout" className="nav-link logout-link">Выйти</a>
                                    </div>
                                </>
                            ) : (
                                <a href="/api/auth/steam" className="steam-login-btn">
                                    <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8 0-3.95 2.87-7.23 6.63-7.87l2.49 3.57c-.34-.05-.69-.07-1.05-.07-2.76 0-5 2.24-5 5s2.24 5 5 5c2.48 0 4.54-1.81 4.93-4.18l2.13 3.04C17.62 18.64 15.01 20 12 20z" />
                                    </svg>
                                    Войти через Steam
                                </a>
                            )}
                        </>
                    )}
                </div>
            </div>
        </nav>
    );
}
