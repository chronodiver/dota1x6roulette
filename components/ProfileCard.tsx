'use client';

import { useState } from 'react';

interface ProfileCardProps {
    username: string;
    avatarUrl: string;
    rating: number;
    completedCount: number;
    failedCount: number;
    activeCount: number;
    createdAt: string;
    isAdmin?: boolean;
    steamId?: string;
    onRatingChanged?: (newRating: number) => void;
}

export default function ProfileCard({
    username,
    avatarUrl,
    rating,
    completedCount,
    failedCount,
    activeCount,
    createdAt,
    isAdmin,
    steamId,
    onRatingChanged,
}: ProfileCardProps) {
    const [editingRating, setEditingRating] = useState(false);
    const [newRating, setNewRating] = useState(rating);
    const [saving, setSaving] = useState(false);

    const handleSaveRating = async () => {
        if (!steamId) return;
        setSaving(true);
        try {
            const res = await fetch(`/api/admin/users/${steamId}/rating`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ rating: newRating }),
            });
            const data = await res.json();
            if (data.success) {
                setEditingRating(false);
                if (onRatingChanged) onRatingChanged(newRating);
            }
        } catch (err) {
            console.error('Failed to update rating:', err);
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="profile-card">
            <div className="profile-header">
                <img src={avatarUrl} alt={username} className="profile-avatar" />
                <div className="profile-info">
                    <h1 className="profile-name">{username}</h1>
                    <p className="profile-joined">
                        Участвует с {new Date(createdAt).toLocaleDateString('ru-RU')}
                    </p>
                </div>
            </div>

            <div className="profile-stats">
                <div className="stat-item">
                    <span className="stat-value">
                        {rating}
                        {isAdmin && (
                            <button
                                className="admin-inline-btn"
                                onClick={() => {
                                    setNewRating(rating);
                                    setEditingRating(!editingRating);
                                }}
                                title="Изменить рейтинг"
                            >
                                ✏️
                            </button>
                        )}
                    </span>
                    <span className="stat-label">⭐ Рейтинг</span>
                </div>
                <div className="stat-item">
                    <span className="stat-value completed">{completedCount}</span>
                    <span className="stat-label">✅ Выполнено</span>
                </div>
                <div className="stat-item">
                    <span className="stat-value failed">{failedCount}</span>
                    <span className="stat-label">❌ Провалено</span>
                </div>
                <div className="stat-item">
                    <span className="stat-value active">{activeCount}</span>
                    <span className="stat-label">🔄 Активных</span>
                </div>
            </div>

            {editingRating && (
                <div className="admin-rating-edit">
                    <input
                        type="number"
                        value={newRating}
                        onChange={e => setNewRating(parseInt(e.target.value) || 0)}
                        className="admin-input"
                    />
                    <button onClick={handleSaveRating} disabled={saving} className="dota-btn admin-btn-save">
                        {saving ? '...' : 'Сохранить'}
                    </button>
                    <button onClick={() => setEditingRating(false)} className="dota-btn admin-btn-cancel">
                        Отмена
                    </button>
                </div>
            )}
        </div>
    );
}
