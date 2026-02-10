'use client';

import Link from 'next/link';

interface LeaderboardEntry {
    rank: number;
    steamId: string;
    username: string;
    avatarUrl: string;
    rating: number;
    completedCount: number;
    failedCount: number;
}

interface LeaderboardTableProps {
    entries: LeaderboardEntry[];
}

export default function LeaderboardTable({ entries }: LeaderboardTableProps) {
    if (entries.length === 0) {
        return (
            <div className="leaderboard-empty">
                <p>Пока нет игроков в рейтинге. Будьте первым!</p>
            </div>
        );
    }

    return (
        <div className="leaderboard-table-wrapper">
            <table className="leaderboard-table">
                <thead>
                    <tr>
                        <th className="col-rank">#</th>
                        <th className="col-player">Игрок</th>
                        <th className="col-completed">✅</th>
                        <th className="col-failed">❌</th>
                        <th className="col-rating">Рейтинг</th>
                    </tr>
                </thead>
                <tbody>
                    {entries.map(entry => (
                        <tr key={entry.steamId} className={`leaderboard-row ${entry.rank <= 3 ? `top-${entry.rank}` : ''}`}>
                            <td className="col-rank">
                                <span className={`rank-badge ${entry.rank <= 3 ? `rank-${entry.rank}` : ''}`}>
                                    {entry.rank <= 3 ? ['🥇', '🥈', '🥉'][entry.rank - 1] : entry.rank}
                                </span>
                            </td>
                            <td className="col-player">
                                <Link href={`/profile/${entry.steamId}`} className="player-link">
                                    <img src={entry.avatarUrl} alt={entry.username} className="player-avatar" />
                                    <span className="player-name">{entry.username}</span>
                                </Link>
                            </td>
                            <td className="col-completed">{entry.completedCount}</td>
                            <td className="col-failed">{entry.failedCount}</td>
                            <td className="col-rating">
                                <span className="rating-value">⭐ {entry.rating}</span>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
