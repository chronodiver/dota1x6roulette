'use client';

import { useEffect, useState } from 'react';
import Roulette from '@/components/Roulette';
import ActiveChallenges from '@/components/ActiveChallenges';

interface ActiveChallenge {
    recordId: number;
    text: string;
    difficulty: string;
    potentialRating: number;
    assignedAt: string;
}

interface User {
    id: number;
    steamId: string;
    username: string;
    avatarUrl: string;
    rating: number;
}

export default function HomePage() {
    const [user, setUser] = useState<User | null>(null);
    const [activeChallenges, setActiveChallenges] = useState<ActiveChallenge[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Fetch user
        fetch('/api/me')
            .then(res => res.json())
            .then(data => {
                setUser(data.user);
                setLoading(false);
                // If logged in, fetch active challenges
                if (data.user) {
                    fetchActiveChallenges();
                }
            })
            .catch(() => setLoading(false));
    }, []);

    const fetchActiveChallenges = async () => {
        try {
            const res = await fetch('/api/challenges/active');
            const data = await res.json();
            if (data.challenges) {
                setActiveChallenges(data.challenges);
            }
        } catch (err) {
            console.error('Failed to fetch active challenges:', err);
        }
    };

    const handleChallengeAssigned = (challenge: {
        recordId?: number;
        text: string;
        difficulty: string;
        potentialRating: number;
    }) => {
        if (challenge.recordId) {
            setActiveChallenges(prev => [
                {
                    recordId: challenge.recordId!,
                    text: challenge.text,
                    difficulty: challenge.difficulty,
                    potentialRating: challenge.potentialRating,
                    assignedAt: new Date().toISOString(),
                },
                ...prev,
            ]);
        }
    };

    const handleComplete = (recordId: number) => {
        setActiveChallenges(prev => prev.filter(c => c.recordId !== recordId));
        // Refresh user data to get updated rating
        fetch('/api/me').then(res => res.json()).then(data => setUser(data.user));
    };

    const handleFail = (recordId: number) => {
        setActiveChallenges(prev => prev.filter(c => c.recordId !== recordId));
        // Refresh user data to get updated rating
        fetch('/api/me').then(res => res.json()).then(data => setUser(data.user));
    };

    return (
        <div className="home-page">
            <div className="home-container">
                <h1 className="page-title">
                    DOTA 1x6 <span className="highlight">Roulette</span>
                </h1>

                <Roulette
                    isLoggedIn={!!user}
                    onChallengeAssigned={handleChallengeAssigned}
                />

                {user && (
                    <ActiveChallenges
                        challenges={activeChallenges}
                        onComplete={handleComplete}
                        onFail={handleFail}
                    />
                )}
            </div>
        </div>
    );
}
