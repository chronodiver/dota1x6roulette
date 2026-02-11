'use client';

import { useState } from 'react';
import { StarIcon, EditIcon, CheckCircleIcon, XCircleIcon, SpinIcon } from '@/components/Icons';

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
    username, avatarUrl, rating, completedCount, failedCount, activeCount, createdAt,
    isAdmin, steamId, onRatingChanged
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
            } else { alert('Ошибка: ' + (data.error || 'Неизвестная ошибка')); }
        } catch { alert('Ошибка сети'); }
        setSaving(false);
    };

    return (
        <div className="profile-card">
            <div className="profile-header">
                <img src={avatarUrl} alt={username} className="profile-avatar" />
                <div className="profile-info">
                    <h2 className="profile-name">{username}</h2>
                    <p className="profile-joined">В игре с {new Date(createdAt).toLocaleDateString('ru-RU')}</p>
                </div>
            </div>

            <div className="profile-stats">
                <div className="stat-item">
                    <div className="stat-value" style={{ color: 'var(--gold)' }}>
                        <StarIcon size={18} color="var(--gold)" /> {rating}
                    </div>
                    <div className="stat-label">Рейтинг</div>
                    {isAdmin && !editingRating && (
                        <button className="admin-inline-btn" title="Изменить рейтинг" onClick={() => { setEditingRating(true); setNewRating(rating); }}>
                            <EditIcon size={14} />
                        </button>
                    )}
                </div>
                <div className="stat-item">
                    <div className="stat-value completed">
                        <CheckCircleIcon size={18} /> {completedCount}
                    </div>
                    <div className="stat-label">Выполнено</div>
                </div>
                <div className="stat-item">
                    <div className="stat-value failed">
                        <XCircleIcon size={18} /> {failedCount}
                    </div>
                    <div className="stat-label">Провалено</div>
                </div>
                <div className="stat-item">
                    <div className="stat-value active">
                        <SpinIcon size={18} color="var(--blue)" /> {activeCount}
                    </div>
                    <div className="stat-label">Активных</div>
                </div>
            </div>

            {editingRating && isAdmin && (
                <div className="admin-rating-edit">
                    <input
                        type="number"
                        value={newRating}
                        onChange={e => setNewRating(parseInt(e.target.value) || 0)}
                        className="admin-input"
                    />
                    <button className="admin-btn-save" onClick={handleSaveRating} disabled={saving}>
                        {saving ? '...' : 'Сохранить'}
                    </button>
                    <button className="admin-btn-cancel" onClick={() => setEditingRating(false)}>
                        Отмена
                    </button>
                </div>
            )}
        </div>
    );
}
