import { Question } from '@common/quiz';

export interface Player {
    name: string;
    score: number;
    questions: Question[];
    answerConfirmed: boolean;
    isCorrect: boolean;
}

