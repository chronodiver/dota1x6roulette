'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { DIFFICULTY_COLORS, DIFFICULTY_LABELS } from '@/lib/challenges';
import { SettingsIcon, PlusIcon, EditIcon, TrashIcon, ChartIcon } from '@/components/Icons';

interface Challenge {
    id: number;
    text: string;
    difficulty: string;
}

interface User {
    isAdmin: boolean;
}

export default function AdminPage() {
    const router = useRouter();
    const [challenges, setChallenges] = useState<Challenge[]>([]);
    const [loading, setLoading] = useState(true);
    const [isAdmin, setIsAdmin] = useState(false);

    // New challenge form
    const [newText, setNewText] = useState('');
    const [newDifficulty, setNewDifficulty] = useState('normal');
    const [adding, setAdding] = useState(false);

    // Editing
    const [editingId, setEditingId] = useState<number | null>(null);
    const [editText, setEditText] = useState('');
    const [editDifficulty, setEditDifficulty] = useState('normal');
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        fetch('/api/me', { cache: 'no-store' })
            .then(res => res.json())
            .then(data => {
                if (!data.user?.isAdmin) { router.push('/'); return; }
                setIsAdmin(true);
                fetchChallenges();
            })
            .catch(() => router.push('/'));
    }, [router]);

    const fetchChallenges = async () => {
        try {
            const res = await fetch('/api/challenges/list', { cache: 'no-store' });
            const data = await res.json();
            setChallenges(data.challenges || []);
        } catch (err) {
            console.error('Failed to fetch challenges:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleAdd = async () => {
        if (!newText.trim()) return;
        setAdding(true);
        try {
            const res = await fetch('/api/admin/challenges', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text: newText.trim(), difficulty: newDifficulty }),
            });
            const data = await res.json();
            if (data.success) {
                setChallenges(prev => [...prev, data.challenge]);
                setNewText('');
                setNewDifficulty('normal');
            }
        } catch (err) {
            console.error('Failed to add challenge:', err);
        } finally {
            setAdding(false);
        }
    };

    const startEdit = (challenge: Challenge) => {
        setEditingId(challenge.id);
        setEditText(challenge.text);
        setEditDifficulty(challenge.difficulty);
    };

    const cancelEdit = () => {
        setEditingId(null);
        setEditText('');
        setEditDifficulty('normal');
    };

    const handleSave = async (id: number) => {
        if (!editText.trim()) return;
        setSaving(true);
        try {
            const res = await fetch(`/api/admin/challenges/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text: editText.trim(), difficulty: editDifficulty }),
            });
            const data = await res.json();
            if (data.success) {
                setChallenges(prev => prev.map(c => c.id === id ? data.challenge : c));
                setEditingId(null);
            }
        } catch (err) {
            console.error('Failed to update challenge:', err);
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm('Удалить этот челлендж?')) return;
        try {
            const res = await fetch(`/api/admin/challenges/${id}`, { method: 'DELETE' });
            const data = await res.json();
            if (data.success) {
                setChallenges(prev => prev.filter(c => c.id !== id));
            }
        } catch (err) {
            console.error('Failed to delete challenge:', err);
        }
    };

    if (!isAdmin || loading) {
        return (
            <div className="admin-page">
                <div className="loading-spinner">
                    <div className="spinner"></div>
                    <p>Загрузка...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="admin-page">
            <h1 className="page-title">Админ-панель</h1>
            <p className="page-subtitle">Управление челленджами для рулетки</p>

            {/* Add new challenge */}
            <div className="admin-add-section">
                <h2><PlusIcon size={18} /> Добавить челлендж</h2>
                <div className="admin-add-form">
                    <textarea
                        value={newText}
                        onChange={e => setNewText(e.target.value)}
                        placeholder="Текст челленджа..."
                        className="admin-input admin-textarea"
                        rows={2}
                    />
                    <div className="admin-add-controls">
                        <select
                            value={newDifficulty}
                            onChange={e => setNewDifficulty(e.target.value)}
                            className="admin-select"
                        >
                            <option value="easy">Easy (+15)</option>
                            <option value="normal">Normal (+25)</option>
                            <option value="hard">Hard (+35)</option>
                            <option value="insane">Insane (+45)</option>
                        </select>
                        <button
                            onClick={handleAdd}
                            disabled={adding || !newText.trim()}
                            className="dota-btn admin-btn-add"
                        >
                            {adding ? 'Добавляю...' : 'Добавить'}
                        </button>
                    </div>
                </div>
            </div>

            {/* Challenge list */}
            <div className="admin-challenges-section">
                <h2><ChartIcon size={18} /> Все челленджи ({challenges.length})</h2>
                <div className="admin-challenges-list">
                    {challenges.map(challenge => (
                        <div key={challenge.id} className="admin-challenge-card">
                            {editingId === challenge.id ? (
                                <div className="admin-edit-form">
                                    <textarea
                                        value={editText}
                                        onChange={e => setEditText(e.target.value)}
                                        className="admin-input admin-textarea"
                                        rows={2}
                                    />
                                    <div className="admin-edit-controls">
                                        <select
                                            value={editDifficulty}
                                            onChange={e => setEditDifficulty(e.target.value)}
                                            className="admin-select"
                                        >
                                            <option value="easy">Easy</option>
                                            <option value="normal">Normal</option>
                                            <option value="hard">Hard</option>
                                            <option value="insane">Insane</option>
                                        </select>
                                        <button
                                            onClick={() => handleSave(challenge.id)}
                                            disabled={saving}
                                            className="admin-btn-save"
                                        >
                                            {saving ? '...' : 'Сохранить'}
                                        </button>
                                        <button onClick={cancelEdit} className="admin-btn-cancel">
                                            Отмена
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <>
                                    <div className="admin-challenge-info">
                                        <span className="admin-challenge-id">#{challenge.id}</span>
                                        <span className="admin-challenge-text">{challenge.text}</span>
                                        <span
                                            className="difficulty-badge"
                                            style={{
                                                backgroundColor: DIFFICULTY_COLORS[challenge.difficulty as keyof typeof DIFFICULTY_COLORS],
                                            }}
                                        >
                                            {DIFFICULTY_LABELS[challenge.difficulty as keyof typeof DIFFICULTY_LABELS]}
                                        </span>
                                    </div>
                                    <div className="admin-challenge-actions">
                                        <button onClick={() => startEdit(challenge)} className="admin-btn-edit">
                                            <EditIcon size={16} />
                                        </button>
                                        <button onClick={() => handleDelete(challenge.id)} className="admin-btn-delete">
                                            <TrashIcon size={16} />
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
