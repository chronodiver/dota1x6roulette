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

// All challenges with difficulty ratings
// id corresponds to the database id, will be synced on init
export const challenges: Challenge[] = [
    { id: 1, text: "3 Игры подряд на одном герое из старой системы", difficulty: "normal" },
    { id: 2, text: "Не подбирать сферы до выпадения легендарки", difficulty: "hard" },
    { id: 3, text: "Первая шмотка после ботинка (грейженная версия ботинка разрешена) — муншард", difficulty: "normal" },
    { id: 4, text: "Катка без вардов", difficulty: "easy" },
    { id: 5, text: "Игра на рандом герое с легендаркой W (2 скилл)", difficulty: "normal" },
    { id: 6, text: "Не качать 1 скилл до легендарки", difficulty: "hard" },
    { id: 7, text: "С нулевой минуты идти гангать до выпадения легендарки, не бить крипов кроме вейвов", difficulty: "insane" },
    { id: 8, text: "Игра на рандом герое с легендаркой Q (1 скилл)", difficulty: "normal" },
    { id: 9, text: "Игра на рандом герое с легендаркой E (3 скилл)", difficulty: "normal" },
    { id: 10, text: "Игра на рандом герое с легендаркой R (ультимейт)", difficulty: "normal" },
    { id: 11, text: "Фаст блинк даггер без сапога", difficulty: "hard" },
    { id: 12, text: "После ботинка (грейженная версия ботинка разрешена) фаст дагон 5", difficulty: "hard" },
    { id: 13, text: "Игнорирование рун и наблюдателей", difficulty: "easy" },
    { id: 14, text: "Катка без Aghanim shard", difficulty: "easy" },
    { id: 15, text: "Катка без Aghanim Scepter (включая Aghanim Essence)", difficulty: "normal" },
    { id: 16, text: "Фаст бф после ботинка (грейженная версия ботинка разрешена)", difficulty: "hard" },
    { id: 17, text: "После ботинка (грейженная версия ботинка разрешена) фаст дагон 5", difficulty: "hard" },
    { id: 18, text: "Стартовый закуп дасты на все деньги", difficulty: "insane" },
    { id: 19, text: "Каждый раз выбирать только самый правый талант (сохраняя редкость сферы)", difficulty: "normal" },
];
