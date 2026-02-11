export interface Challenge {
    id: number;
    text: string;
    difficulty: 'easy' | 'normal' | 'hard' | 'insane';
}

export const RATING_REWARDS: Record<Challenge['difficulty'], number> = {
    easy: 15,
    normal: 25,
    hard: 35,
    insane: 45,
};

export const DIFFICULTY_LABELS: Record<Challenge['difficulty'], string> = {
    easy: 'Easy',
    normal: 'Normal',
    hard: 'Hard',
    insane: 'Insane',
};

export const DIFFICULTY_COLORS: Record<Challenge['difficulty'], string> = {
    easy: '#4caf50',
    normal: '#2196f3',
    hard: '#ff9800',
    insane: '#e91e63',
};
