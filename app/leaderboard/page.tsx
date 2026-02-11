'use client';

import { useEffect, useState } from 'react';
import LeaderboardTable from '@/components/LeaderboardTable';

interface LeaderboardEntry {
    rank: number;
    steamId: string;
    username: string;
    avatarUrl: string;
    rating: number;
    completedCount: number;
    failedCount: number;
}

export default function LeaderboardPage() {
    const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('/api/leaderboard', { cache: 'no-store' })
            .then(res => res.json())
            .then(data => {
                setEntries(data.leaderboard || []);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, []);

    return (
        <div className="leaderboard-page">
            <h1 className="page-title">🏆 Таблица лидеров</h1>
            <p className="page-subtitle">Лучшие игроки Dota 1x6 Challenge</p>

            {loading ? (
                <div className="loading-spinner">
                    <div className="spinner"></div>
                    <p>Загрузка...</p>
                </div>
            ) : (
                <LeaderboardTable entries={entries} />
            )}
        </div>
    );
}
