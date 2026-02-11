'use client';

import { useState } from 'react';
import { DIFFICULTY_COLORS, DIFFICULTY_LABELS } from '@/lib/challenges';
import { SpinIcon, CheckCircleIcon, XCircleIcon, StarIcon } from '@/components/Icons';

interface ActiveChallenge {
    recordId: number;
    text: string;
    difficulty: string;
    potentialRating: number;
    assignedAt: string;
}

interface ActiveChallengesProps {
    challenges: ActiveChallenge[];
    onComplete: (recordId: number) => void;
    onFail: (recordId: number) => void;
}

export default function ActiveChallenges({ challenges, onComplete, onFail }: ActiveChallengesProps) {
    const [loadingId, setLoadingId] = useState<number | null>(null);

    if (challenges.length === 0) {
        return (
            <div className="active-challenges">
                <h3><SpinIcon size={18} color="var(--blue)" /> Активные задания</h3>
                <p className="empty-state">Нет активных заданий. Прокрутите рулетку!</p>
            </div>
        );
    }

    const handleAction = async (recordId: number, action: 'complete' | 'fail') => {
        setLoadingId(recordId);
        try {
            const res = await fetch(`/api/challenges/${action}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ recordId }),
            });
            const data = await res.json();
            if (data.success) {
                if (action === 'complete') onComplete(recordId);
                else onFail(recordId);
            }
        } catch (err) {
            console.error(`Failed to ${action} challenge:`, err);
        } finally {
            setLoadingId(null);
        }
    };

    return (
        <div className="active-challenges">
            <h3>
                <SpinIcon size={18} color="var(--blue)" /> Активные задания
                <span className="challenge-count">{challenges.length}</span>
            </h3>
            <div className="challenges-list">
                {challenges.map(challenge => (
                    <div key={challenge.recordId} className="challenge-card">
                        <div className="challenge-card-header">
                            <span
                                className="difficulty-badge"
                                style={{ backgroundColor: DIFFICULTY_COLORS[challenge.difficulty as keyof typeof DIFFICULTY_COLORS] }}
                            >
                                {DIFFICULTY_LABELS[challenge.difficulty as keyof typeof DIFFICULTY_LABELS]}
                            </span>
                            <span className="challenge-rating">
                                <StarIcon size={14} color="var(--gold)" /> {challenge.potentialRating}
                            </span>
                        </div>
                        <p className="challenge-card-text">{challenge.text}</p>
                        <div className="challenge-card-actions">
                            <button
                                className="btn-complete"
                                onClick={() => handleAction(challenge.recordId, 'complete')}
                                disabled={loadingId === challenge.recordId}
                            >
                                <CheckCircleIcon size={16} /> Выполнил
                            </button>
                            <button
                                className="btn-fail"
                                onClick={() => handleAction(challenge.recordId, 'fail')}
                                disabled={loadingId === challenge.recordId}
                            >
                                <XCircleIcon size={16} /> Провалил
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
