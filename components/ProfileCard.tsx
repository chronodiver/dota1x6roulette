'use client';

interface ProfileCardProps {
    username: string;
    avatarUrl: string;
    rating: number;
    completedCount: number;
    failedCount: number;
    activeCount: number;
    createdAt: string;
}

export default function ProfileCard({
    username,
    avatarUrl,
    rating,
    completedCount,
    failedCount,
    activeCount,
    createdAt,
}: ProfileCardProps) {
    const totalGames = completedCount + failedCount;
    const winRate = totalGames > 0 ? Math.round((completedCount / totalGames) * 100) : 0;

    return (
        <div className="profile-card">
            <div className="profile-card-header">
                <img src={avatarUrl} alt={username} className="profile-avatar" />
                <div className="profile-info">
                    <h2 className="profile-name">{username}</h2>
                    <p className="profile-joined">
                        Участник с {new Date(createdAt).toLocaleDateString('ru-RU', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                        })}
                    </p>
                </div>
            </div>

            <div className="profile-stats">
                <div className="stat-card stat-rating">
                    <span className="stat-value">⭐ {rating}</span>
                    <span className="stat-label">Рейтинг</span>
                </div>
                <div className="stat-card stat-completed">
                    <span className="stat-value">{completedCount}</span>
                    <span className="stat-label">Выполнено</span>
                </div>
                <div className="stat-card stat-failed">
                    <span className="stat-value">{failedCount}</span>
                    <span className="stat-label">Провалено</span>
                </div>
                <div className="stat-card stat-active">
                    <span className="stat-value">{activeCount}</span>
                    <span className="stat-label">Активных</span>
                </div>
                <div className="stat-card stat-winrate">
                    <span className="stat-value">{winRate}%</span>
                    <span className="stat-label">Успешность</span>
                </div>
            </div>
        </div>
    );
}
