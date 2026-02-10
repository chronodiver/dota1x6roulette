'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { challenges, DIFFICULTY_COLORS, DIFFICULTY_LABELS, RATING_REWARDS } from '@/lib/challenges';

interface SpinResult {
    recordId?: number;
    text: string;
    difficulty: string;
    potentialRating: number;
}

interface RouletteProps {
    isLoggedIn: boolean;
    onChallengeAssigned?: (challenge: SpinResult) => void;
}

// Sound utilities
let audioCtx: AudioContext | null = null;
let masterGain: GainNode | null = null;

function initAudio() {
    if (!audioCtx) {
        audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
        masterGain = audioCtx.createGain();
        masterGain.gain.value = 0.3;
        masterGain.connect(audioCtx.destination);
    }
    if (audioCtx.state === 'suspended') {
        audioCtx.resume();
    }
}

function playTickSound() {
    if (audioCtx && masterGain) {
        const osc = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();
        osc.type = 'triangle';
        const pitch = 600 + Math.random() * 200;
        osc.frequency.setValueAtTime(pitch, audioCtx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(100, audioCtx.currentTime + 0.05);
        gainNode.gain.setValueAtTime(0.3, audioCtx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.05);
        osc.connect(gainNode);
        gainNode.connect(masterGain);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.05);
    }
}

function playWinSound() {
    if (audioCtx && masterGain) {
        const notes = [440, 554.37, 659.25, 880];
        notes.forEach((freq, i) => {
            const osc = audioCtx!.createOscillator();
            const gainNode = audioCtx!.createGain();
            osc.type = 'sine';
            osc.frequency.value = freq;
            const now = audioCtx!.currentTime;
            gainNode.gain.setValueAtTime(0, now);
            gainNode.gain.linearRampToValueAtTime(0.2, now + 0.1);
            gainNode.gain.exponentialRampToValueAtTime(0.001, now + 2);
            osc.connect(gainNode);
            gainNode.connect(masterGain!);
            osc.start(now + i * 0.05);
            osc.stop(now + 2.5);
        });
    }
}

function easeOutCubic(t: number): number {
    return 1 - Math.pow(1 - t, 3);
}

const SEGMENT_COLORS = ['#8B0000', '#2F4F4F', '#191970', '#556B2F', '#A52A2A', '#4B0082'];

export default function Roulette({ isLoggedIn, onChallengeAssigned }: RouletteProps) {
    const wheelRef = useRef<HTMLDivElement>(null);
    const [isSpinning, setIsSpinning] = useState(false);
    const [resultText, setResultText] = useState('Готов к прокрутке...');
    const [resultHighlight, setResultHighlight] = useState(false);
    const [resultDifficulty, setResultDifficulty] = useState<string | null>(null);
    const [history, setHistory] = useState<Array<{ text: string; time: string; difficulty: string }>>([]);
    const currentRotationRef = useRef(0);
    const animFrameRef = useRef<number>(0);

    const numSegments = challenges.length;
    const segmentAngle = 360 / numSegments;

    // Generate conic gradient
    const gradient = challenges.map((_, i) => {
        const color = SEGMENT_COLORS[i % SEGMENT_COLORS.length];
        const start = i * segmentAngle;
        const end = (i + 1) * segmentAngle;
        return `${color} ${start}deg ${end}deg`;
    }).join(',');

    const spinWheel = useCallback(() => {
        if (isSpinning) return;
        initAudio();
        setIsSpinning(true);
        setResultText('Крутимся...');
        setResultHighlight(false);
        setResultDifficulty(null);

        const randomSegment = Math.floor(Math.random() * numSegments);
        const segmentCenter = (randomSegment * segmentAngle) + (segmentAngle / 2);
        const targetMod = (360 - segmentCenter) % 360;
        const extraSpins = 5 + Math.floor(Math.random() * 3);
        const fullSpinsRot = extraSpins * 360;

        const currentMod = currentRotationRef.current % 360;
        let distance = targetMod - currentMod;
        if (distance < 0) distance += 360;

        const totalRotationNeeded = fullSpinsRot + distance;
        const startRotation = currentRotationRef.current;
        const finalRotation = startRotation + totalRotationNeeded;

        const duration = 5000;
        const startTime = performance.now();
        let lastAngle = startRotation;

        function animate(time: number) {
            const elapsed = time - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const easeVal = easeOutCubic(progress);
            const currentAngle = startRotation + (totalRotationNeeded * easeVal);

            if (wheelRef.current) {
                wheelRef.current.style.transform = `rotate(${currentAngle}deg)`;
            }

            const lastIndex = Math.floor(lastAngle / segmentAngle);
            const currentIndex = Math.floor(currentAngle / segmentAngle);
            if (currentIndex > lastIndex) {
                playTickSound();
            }
            lastAngle = currentAngle;

            if (progress < 1) {
                animFrameRef.current = requestAnimationFrame(animate);
            } else {
                currentRotationRef.current = finalRotation;
                setIsSpinning(false);
                finishSpin(randomSegment);
            }
        }

        const finishSpin = async (segIdx: number) => {
            playWinSound();
            const challenge = challenges[segIdx];
            setResultText(challenge.text);
            setResultHighlight(true);
            setResultDifficulty(challenge.difficulty);

            // Add to local history
            const now = new Date();
            const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
            setHistory(prev => [{ text: challenge.text, time: timeStr, difficulty: challenge.difficulty }, ...prev]);

            // Save to server if logged in
            if (isLoggedIn) {
                try {
                    const res = await fetch('/api/challenges/spin', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ challengeId: challenge.id }),
                    });
                    const data = await res.json();
                    if (data.success && onChallengeAssigned) {
                        onChallengeAssigned({
                            recordId: data.challenge.recordId,
                            text: challenge.text,
                            difficulty: challenge.difficulty,
                            potentialRating: RATING_REWARDS[challenge.difficulty],
                        });
                    }
                } catch (err) {
                    console.error('Failed to save challenge:', err);
                }
            }
        };

        animFrameRef.current = requestAnimationFrame(animate);
    }, [isSpinning, numSegments, segmentAngle, isLoggedIn, onChallengeAssigned]);

    useEffect(() => {
        return () => {
            if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
        };
    }, []);

    return (
        <div className="roulette-section">
            <div className="roulette-container">
                <div className="pointer">▼</div>
                <div className="wheel-shadow"></div>
                <div
                    ref={wheelRef}
                    className="wheel"
                    style={{ background: `conic-gradient(${gradient})` }}
                ></div>
                <div className="center-piece"></div>
            </div>

            <button
                className="dota-btn"
                onClick={spinWheel}
                disabled={isSpinning}
            >
                ПРОКРУТИТЬ
            </button>

            <div className="result-container">
                <h2>Текущее задание:</h2>
                <div className={`result-text ${resultHighlight ? 'highlight' : ''}`}>
                    {resultText}
                </div>
                {resultDifficulty && (
                    <span
                        className="difficulty-badge"
                        style={{
                            backgroundColor: DIFFICULTY_COLORS[resultDifficulty as keyof typeof DIFFICULTY_COLORS],
                        }}
                    >
                        {DIFFICULTY_LABELS[resultDifficulty as keyof typeof DIFFICULTY_LABELS]}
                        {' — '}
                        {RATING_REWARDS[resultDifficulty as keyof typeof RATING_REWARDS]} ⭐
                    </span>
                )}
            </div>

            {!isLoggedIn && (
                <div className="auth-hint">
                    <p>💡 <a href="/api/auth/steam">Войдите через Steam</a>, чтобы сохранять задания и попасть в рейтинг!</p>
                </div>
            )}

            <div className="history-container">
                <h3>История</h3>
                <ul className="history-list">
                    {history.map((item, i) => (
                        <li key={i}>
                            <span className="history-text">
                                <span
                                    className="difficulty-dot"
                                    style={{ backgroundColor: DIFFICULTY_COLORS[item.difficulty as keyof typeof DIFFICULTY_COLORS] }}
                                ></span>
                                {item.text}
                            </span>
                            <span className="time">{item.time}</span>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
}
