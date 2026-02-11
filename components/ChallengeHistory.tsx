'use client';

import { DIFFICULTY_COLORS, DIFFICULTY_LABELS } from '@/lib/challenges';
import { CheckCircleIcon, XCircleIcon, SpinIcon, StarIcon, TrashIcon } from '@/components/Icons';

interface UserChallenge {
    recordId: number;
    text: string;
    difficulty: string;
    status: string;
    ratingChange: number;
    assignedAt: string;
    completedAt?: string | null;
}

interface ChallengeHistoryProps {
    challenges: UserChallenge[];
    isAdmin?: boolean;
    onDelete?: (id: number) => void;
}

export default function ChallengeHistory({ challenges, isAdmin, onDelete }: ChallengeHistoryProps) {
    const handleDelete = async (id: number, status: string, ratingChange: number) => {
        const msg = status === 'completed'
            ? `Удалить выполненный челлендж? Рейтинг будет уменьшен на ${ratingChange}`
            : status === 'failed'
                ? `Удалить проваленный челлендж? Рейтинг будет увеличен на ${Math.abs(ratingChange)}`
                : 'Удалить активный челлендж?';

        if (!confirm(msg)) return;

        try {
            const res = await fetch(`/api/admin/user-challenges/${id}`, { method: 'DELETE' });
            const data = await res.json();
            if (data.success && onDelete) onDelete(id);
            else if (!data.success) alert('Ошибка: ' + (data.error || 'Неизвестная'));
        } catch { alert('Ошибка сети'); }
    };

    const statusIcon = (status: string) => {
        switch (status) {
            case 'completed': return <CheckCircleIcon size={14} />;
            case 'failed': return <XCircleIcon size={14} />;
            default: return <SpinIcon size={14} color="var(--blue)" />;
        }
    };

    const statusLabel = (status: string) => {
        switch (status) {
            case 'completed': return 'Выполнен';
            case 'failed': return 'Провален';
            default: return 'Активен';
        }
    };

    if (challenges.length === 0) {
        return (
            <div className="challenge-history">
                <h2>История заданий</h2>
                <p className="empty-text">Нет заданий</p>
            </div>
        );
    }

    return (
        <div className="challenge-history">
            <h2>История заданий</h2>
            <div className="challenge-grid">
                {challenges.map(c => (
                    <div key={c.recordId} className={`challenge-card status-${c.status}`}>
                        <div className="challenge-card-header">
                            <span
                                className="difficulty-badge"
                                style={{ backgroundColor: DIFFICULTY_COLORS[c.difficulty as keyof typeof DIFFICULTY_COLORS] }}
                            >
                                {DIFFICULTY_LABELS[c.difficulty as keyof typeof DIFFICULTY_LABELS]}
                            </span>
                            {c.ratingChange !== 0 && (
                                <span className={`rating-change ${c.ratingChange > 0 ? 'positive' : 'negative'}`}>
                                    <StarIcon size={14} color={c.ratingChange > 0 ? 'var(--green)' : 'var(--red)'} />
                                    {c.ratingChange > 0 ? '+' : ''}{c.ratingChange}
                                </span>
                            )}
                        </div>
                        <div className="challenge-text">{c.text}</div>
                        <div className="challenge-card-footer">
                            <span className={`status-badge ${c.status}`}>
                                {statusIcon(c.status)} {statusLabel(c.status)}
                            </span>
                            <span className="challenge-date">
                                {new Date(c.assignedAt).toLocaleDateString('ru-RU')}
                            </span>
                            {isAdmin && (
                                <button
                                    className="admin-btn-delete-small"
                                    title="Удалить"
                                    onClick={() => handleDelete(c.recordId, c.status, c.ratingChange)}
                                >
                                    <TrashIcon size={14} />
                                </button>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
