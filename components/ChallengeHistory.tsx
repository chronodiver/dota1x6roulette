'use client';

import { DIFFICULTY_COLORS, DIFFICULTY_LABELS } from '@/lib/challenges';

interface ChallengeRecord {
    recordId: number;
    text: string;
    difficulty: string;
    status: string;
    ratingChange: number;
    assignedAt: string;
    completedAt: string | null;
}

interface ChallengeHistoryProps {
    challenges: ChallengeRecord[];
    isAdmin?: boolean;
    onDelete?: (recordId: number) => void;
}

export default function ChallengeHistory({ challenges, isAdmin, onDelete }: ChallengeHistoryProps) {
    const handleDelete = async (recordId: number) => {
        if (!confirm('Удалить это задание? Рейтинг будет откачен.')) return;
        try {
            const res = await fetch(`/api/admin/user-challenges/${recordId}`, { method: 'DELETE' });
            const data = await res.json();
            if (data.success && onDelete) {
                onDelete(recordId);
            }
        } catch (err) {
            console.error('Failed to delete challenge:', err);
        }
    };

    if (challenges.length === 0) {
        return (
            <div className="challenge-history">
                <h2>📜 История заданий</h2>
                <p className="empty-text">Заданий пока нет</p>
            </div>
        );
    }

    return (
        <div className="challenge-history">
            <h2>📜 История заданий</h2>
            <div className="challenge-grid">
                {challenges.map(challenge => (
                    <div
                        key={challenge.recordId}
                        className={`challenge-card status-${challenge.status}`}
                    >
                        <div className="challenge-card-header">
                            <span
                                className="difficulty-badge"
                                style={{
                                    backgroundColor: DIFFICULTY_COLORS[challenge.difficulty as keyof typeof DIFFICULTY_COLORS],
                                }}
                            >
                                {DIFFICULTY_LABELS[challenge.difficulty as keyof typeof DIFFICULTY_LABELS]}
                            </span>
                            <span className={`status-badge ${challenge.status}`}>
                                {challenge.status === 'completed' ? '✅' : challenge.status === 'failed' ? '❌' : '🔄'}
                                {' '}
                                {challenge.status === 'completed' ? 'Выполнено' : challenge.status === 'failed' ? 'Провалено' : 'Активно'}
                            </span>
                        </div>
                        <p className="challenge-text">{challenge.text}</p>
                        <div className="challenge-card-footer">
                            <span className={`rating-change ${challenge.ratingChange >= 0 ? 'positive' : 'negative'}`}>
                                {challenge.status === 'active'
                                    ? `±${challenge.ratingChange} ⭐`
                                    : `${challenge.ratingChange >= 0 ? '+' : ''}${challenge.ratingChange} ⭐`}
                            </span>
                            <span className="challenge-date">
                                {new Date(challenge.assignedAt).toLocaleDateString('ru-RU')}
                            </span>
                            {isAdmin && (
                                <button
                                    className="admin-btn-delete-small"
                                    onClick={() => handleDelete(challenge.recordId)}
                                    title="Удалить задание"
                                >
                                    🗑️
                                </button>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
