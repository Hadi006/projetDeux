export interface QuestionData {
    id: number;
    value: number;
    question: string;
    answers: string[];
    correctAnswers: string[];
    isMCQ: boolean;
}
