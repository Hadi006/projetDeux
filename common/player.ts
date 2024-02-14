export interface Player {
    id: number;
    name: string;
    score: number;
    answer: boolean[];
    answerConfirmed: boolean;
    isCorrect: boolean;
}
