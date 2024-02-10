export interface QuestionData {
    id: number;
    points: number;
    question: string;
    answers: string[];
    correctAnswers: string[];
    isMCQ: boolean;
}
