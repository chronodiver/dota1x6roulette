'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { DIFFICULTY_COLORS, DIFFICULTY_LABELS, RATING_REWARDS, Challenge } from '@/lib/challenges';
import { StarIcon, HistoryIcon } from '@/components/Icons';

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

// Audio
let audioCtx: AudioContext | null = null;
let masterGain: GainNode | null = null;

function initAudio() {
    if (!audioCtx) {
        audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
        masterGain = audioCtx.createGain();
        masterGain.gain.value = 0.3;
        masterGain.connect(audioCtx.destination);
    }
    if (audioCtx.state === 'suspended') audioCtx.resume();
}

function playTickSound() {
    if (!audioCtx || !masterGain) return;
    const osc = audioCtx.createOscillator();
    const g = audioCtx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(600 + Math.random() * 200, audioCtx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(100, audioCtx.currentTime + 0.05);
    g.gain.setValueAtTime(0.3, audioCtx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.05);
    osc.connect(g); g.connect(masterGain);
    osc.start(); osc.stop(audioCtx.currentTime + 0.05);
}

function playWinSound() {
    if (!audioCtx || !masterGain) return;
    [440, 554.37, 659.25, 880].forEach((freq, i) => {
        const osc = audioCtx!.createOscillator();
        const g = audioCtx!.createGain();
        osc.type = 'sine'; osc.frequency.value = freq;
        const now = audioCtx!.currentTime;
        g.gain.setValueAtTime(0, now);
        g.gain.linearRampToValueAtTime(0.2, now + 0.1);
        g.gain.exponentialRampToValueAtTime(0.001, now + 2);
        osc.connect(g); g.connect(masterGain!);
        osc.start(now + i * 0.05); osc.stop(now + 2.5);
    });
}

function easeOutCubic(t: number): number {
    return 1 - Math.pow(1 - t, 3);
}

// Sector colors: alternating dark shades
const SECTOR_COLORS = [
    '#0c2030', '#112a38', '#0a1e2e', '#142f3d',
    '#0d2232', '#10283a', '#0b2030', '#132d3b',
];

function wrapText(text: string, maxCharsPerLine: number): string[] {
    const words = text.split(' ');
    const lines: string[] = [];
    let current = '';
    for (const word of words) {
        if (current.length + word.length + 1 > maxCharsPerLine && current.length > 0) {
            lines.push(current);
            current = word;
        } else {
            current = current ? current + ' ' + word : word;
        }
    }
    if (current) lines.push(current);
    return lines;
}

export default function Roulette({ isLoggedIn, onChallengeAssigned }: RouletteProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [isSpinning, setIsSpinning] = useState(false);
    const [resultText, setResultText] = useState('Готов к прокрутке...');
    const [resultHighlight, setResultHighlight] = useState(false);
    const [resultDifficulty, setResultDifficulty] = useState<string | null>(null);
    const [history, setHistory] = useState<Array<{ text: string; time: string; difficulty: string }>>([]);
    const [challenges, setChallenges] = useState<Challenge[]>([]);
    const [loadingChallenges, setLoadingChallenges] = useState(true);
    const currentRotationRef = useRef(0);
    const animFrameRef = useRef<number>(0);

    // Fetch challenges
    useEffect(() => {
        fetch('/api/challenges/list', { cache: 'no-store' })
            .then(res => res.json())
            .then(data => { setChallenges(data.challenges || []); setLoadingChallenges(false); })
            .catch(() => setLoadingChallenges(false));
    }, []);

    const numSegments = challenges.length;
    const segmentAngle = numSegments > 0 ? (2 * Math.PI) / numSegments : 0;

    // Draw wheel
    const drawWheel = useCallback((rotation: number) => {
        const canvas = canvasRef.current;
        if (!canvas || numSegments === 0) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const dpr = window.devicePixelRatio || 1;
        const size = canvas.clientWidth;
        canvas.width = size * dpr;
        canvas.height = size * dpr;
        ctx.scale(dpr, dpr);

        const cx = size / 2;
        const cy = size / 2;
        const radius = size / 2 - 4;

        ctx.clearRect(0, 0, size, size);
        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate((rotation * Math.PI) / 180);

        // Draw sectors
        for (let i = 0; i < numSegments; i++) {
            const startAngle = i * segmentAngle - Math.PI / 2;
            const endAngle = startAngle + segmentAngle;
            const color = SECTOR_COLORS[i % SECTOR_COLORS.length];

            // Sector fill
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.arc(0, 0, radius, startAngle, endAngle);
            ctx.closePath();
            ctx.fillStyle = color;
            ctx.fill();

            // Sector border
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.arc(0, 0, radius, startAngle, endAngle);
            ctx.closePath();
            ctx.strokeStyle = 'rgba(45, 53, 56, 0.6)';
            ctx.lineWidth = 1;
            ctx.stroke();

            // Difficulty color indicator (inner arc)
            const diffColor = DIFFICULTY_COLORS[challenges[i].difficulty as keyof typeof DIFFICULTY_COLORS] || '#fff';
            ctx.beginPath();
            ctx.arc(0, 0, radius - 2, startAngle, endAngle);
            ctx.strokeStyle = diffColor;
            ctx.lineWidth = 3;
            ctx.stroke();

            // Text
            ctx.save();
            const midAngle = startAngle + segmentAngle / 2;
            ctx.rotate(midAngle);

            const text = challenges[i].text;
            const maxLen = numSegments > 12 ? 18 : 25;
            const lines = wrapText(text, maxLen);
            const fontSize = numSegments > 15 ? 10 : numSegments > 10 ? 11 : 12;
            ctx.font = `${fontSize}px Radiance, sans-serif`;
            ctx.fillStyle = '#ccc';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';

            const textRadius = radius * 0.58;
            const lineHeight = fontSize + 2;
            const totalHeight = lines.length * lineHeight;
            const startY = -totalHeight / 2 + lineHeight / 2;

            lines.forEach((line, li) => {
                ctx.fillText(line, textRadius, startY + li * lineHeight, radius * 0.4);
            });

            ctx.restore();
        }

        ctx.restore();
    }, [challenges, numSegments, segmentAngle]);

    // Initial draw
    useEffect(() => {
        if (challenges.length > 0) drawWheel(0);
    }, [challenges, drawWheel]);

    // Resize handler
    useEffect(() => {
        const handleResize = () => drawWheel(currentRotationRef.current);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, [drawWheel]);

    const spinWheel = useCallback(() => {
        if (isSpinning || challenges.length === 0) return;
        initAudio();
        setIsSpinning(true);
        setResultText('Крутимся...');
        setResultHighlight(false);
        setResultDifficulty(null);

        const segAngleDeg = 360 / numSegments;
        const randomSegment = Math.floor(Math.random() * numSegments);
        const segmentCenter = (randomSegment * segAngleDeg) + (segAngleDeg / 2);
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
        let lastSegIndex = Math.floor((currentRotationRef.current % 360) / segAngleDeg);

        function animate(time: number) {
            const elapsed = time - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const easeVal = easeOutCubic(progress);
            const currentAngle = startRotation + (totalRotationNeeded * easeVal);

            drawWheel(currentAngle);

            const currentSegIndex = Math.floor((currentAngle % 360) / segAngleDeg);
            if (currentSegIndex !== lastSegIndex) playTickSound();
            lastSegIndex = currentSegIndex;

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

            const now = new Date();
            const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
            setHistory(prev => [{ text: challenge.text, time: timeStr, difficulty: challenge.difficulty }, ...prev]);

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
                            potentialRating: RATING_REWARDS[challenge.difficulty as keyof typeof RATING_REWARDS],
                        });
                    }
                } catch (err) {
                    console.error('Failed to save challenge:', err);
                }
            }
        };

        animFrameRef.current = requestAnimationFrame(animate);
    }, [isSpinning, challenges, numSegments, drawWheel, isLoggedIn, onChallengeAssigned]);

    useEffect(() => {
        return () => { if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current); };
    }, []);

    if (loadingChallenges) {
        return (
            <div className="roulette-section">
                <div className="loading-spinner">
                    <div className="spinner"></div>
                    <p>Загрузка челленджей...</p>
                </div>
            </div>
        );
    }

    if (challenges.length === 0) {
        return (
            <div className="roulette-section">
                <p className="empty-state">Нет доступных челленджей</p>
            </div>
        );
    }

    return (
        <div className="roulette-section">
            <div className="roulette-container">
                <div className="pointer"></div>
                <canvas
                    ref={canvasRef}
                    className="wheel-canvas"
                    style={{ width: '100%', height: '100%' }}
                />
                <div className="wheel-border"></div>
                <div className="center-piece"></div>
            </div>

            <button className="dota-btn" onClick={spinWheel} disabled={isSpinning}>
                ПРОКРУТИТЬ
            </button>

            <div className="result-container">
                <h2>Текущее задание</h2>
                <div className={`result-text ${resultHighlight ? 'highlight' : ''}`}>
                    {resultText}
                </div>
                {resultDifficulty && (
                    <div style={{ marginTop: 12, display: 'flex', justifyContent: 'center' }}>
                        <span
                            className="difficulty-badge"
                            style={{
                                backgroundColor: DIFFICULTY_COLORS[resultDifficulty as keyof typeof DIFFICULTY_COLORS],
                            }}
                        >
                            {DIFFICULTY_LABELS[resultDifficulty as keyof typeof DIFFICULTY_LABELS]}
                            {' — '}
                            {RATING_REWARDS[resultDifficulty as keyof typeof RATING_REWARDS]}
                            <StarIcon size={14} color="#fff" />
                        </span>
                    </div>
                )}
            </div>

            {!isLoggedIn && (
                <div className="auth-hint">
                    <a href="/api/auth/steam">Войдите через Steam</a>, чтобы сохранять задания и попасть в рейтинг!
                </div>
            )}

            {history.length > 0 && (
                <div className="history-container">
                    <h3><HistoryIcon size={18} /> История</h3>
                    <ul className="history-list">
                        {history.map((item, i) => (
                            <li key={i}>
                                <span className="history-text">
                                    <span className="difficulty-dot" style={{ backgroundColor: DIFFICULTY_COLORS[item.difficulty as keyof typeof DIFFICULTY_COLORS] }}></span>
                                    {item.text}
                                </span>
                                <span className="time">{item.time}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
}
