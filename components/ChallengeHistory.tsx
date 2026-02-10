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
}

export default function ChallengeHistory({ challenges }: ChallengeHistoryProps) {
    if (challenges.length === 0) {
        return (
            <div className="challenge-history">
                <h3>📜 История заданий</h3>
                <p className="empty-state">Ещё нет заданий</p>
            </div>
        );
    }

    return (
        <div className="challenge-history">
            <h3>📜 История заданий</h3>
            <div className="history-grid">
                {challenges.map(challenge => (
                    <div key={challenge.recordId} className={`history-card status-${challenge.status}`}>
                        <div className="history-card-top">
                            <span
                                className="difficulty-badge"
                                style={{ backgroundColor: DIFFICULTY_COLORS[challenge.difficulty as keyof typeof DIFFICULTY_COLORS] }}
                            >
                                {DIFFICULTY_LABELS[challenge.difficulty as keyof typeof DIFFICULTY_LABELS]}
                            </span>
                            <span className={`status-badge status-${challenge.status}`}>
                                {challenge.status === 'completed' ? '✅ Выполнено' :
                                    challenge.status === 'failed' ? '❌ Провалено' :
                                        '⏳ Активно'}
                            </span>
                        </div>
                        <p className="history-card-text">{challenge.text}</p>
                        <div className="history-card-bottom">
                            <span className={`rating-change ${challenge.ratingChange >= 0 ? 'positive' : 'negative'}`}>
                                {challenge.status !== 'active' && (
                                    <>{challenge.ratingChange > 0 ? '+' : ''}{challenge.ratingChange} ⭐</>
                                )}
                                {challenge.status === 'active' && (
                                    <>±{Math.abs(challenge.ratingChange)} ⭐</>
                                )}
                            </span>
                            <span className="history-date">
                                {new Date(challenge.assignedAt).toLocaleDateString('ru-RU', {
                                    day: 'numeric',
                                    month: 'short',
                                    year: 'numeric',
                                })}
                            </span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
