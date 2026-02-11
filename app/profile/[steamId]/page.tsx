'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import ProfileCard from '@/components/ProfileCard';
import ChallengeHistory from '@/components/ChallengeHistory';

interface Profile {
    steamId: string;
    username: string;
    avatarUrl: string;
    rating: number;
    createdAt: string;
    completedCount: number;
    failedCount: number;
    activeCount: number;
}

interface ChallengeRecord {
    recordId: number;
    text: string;
    difficulty: string;
    status: string;
    ratingChange: number;
    assignedAt: string;
    completedAt: string | null;
}

export default function ProfilePage() {
    const params = useParams();
    const steamId = params.steamId as string;
    const [profile, setProfile] = useState<Profile | null>(null);
    const [challenges, setChallenges] = useState<ChallengeRecord[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isAdmin, setIsAdmin] = useState(false);

    useEffect(() => {
        // Check if current user is admin
        fetch('/api/me', { cache: 'no-store' })
            .then(res => res.json())
            .then(data => {
                if (data.user?.isAdmin) setIsAdmin(true);
            })
            .catch(() => { });
    }, []);

    useEffect(() => {
        if (!steamId) return;

        fetch(`/api/profile/${steamId}`, { cache: 'no-store' })
            .then(res => {
                if (!res.ok) throw new Error('Профиль не найден');
                return res.json();
            })
            .then(data => {
                setProfile(data.profile);
                setChallenges(data.challenges || []);
                setLoading(false);
            })
            .catch(err => {
                setError(err.message);
                setLoading(false);
            });
    }, [steamId]);

    const handleRatingChanged = (newRating: number) => {
        if (profile) {
            setProfile({ ...profile, rating: newRating });
        }
    };

    const handleChallengeDeleted = (recordId: number) => {
        setChallenges(prev => prev.filter(c => c.recordId !== recordId));
        // Refresh profile to get updated stats
        fetch(`/api/profile/${steamId}`, { cache: 'no-store' })
            .then(res => res.json())
            .then(data => {
                if (data.profile) setProfile(data.profile);
            })
            .catch(() => { });
    };

    if (loading) {
        return (
            <div className="profile-page">
                <div className="loading-spinner">
                    <div className="spinner"></div>
                    <p>Загрузка профиля...</p>
                </div>
            </div>
        );
    }

    if (error || !profile) {
        return (
            <div className="profile-page">
                <div className="error-state">
                    <h2>😔 {error || 'Профиль не найден'}</h2>
                    <p>Возможно, этот пользователь ещё не зарегистрирован.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="profile-page">
            <ProfileCard
                username={profile.username}
                avatarUrl={profile.avatarUrl}
                rating={profile.rating}
                completedCount={profile.completedCount}
                failedCount={profile.failedCount}
                activeCount={profile.activeCount}
                createdAt={profile.createdAt}
                isAdmin={isAdmin}
                steamId={profile.steamId}
                onRatingChanged={handleRatingChanged}
            />
            <ChallengeHistory
                challenges={challenges}
                isAdmin={isAdmin}
                onDelete={handleChallengeDeleted}
            />
        </div>
    );
}
