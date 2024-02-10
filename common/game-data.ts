import { QuestionData } from '@common/question-data';
export interface GameData {
    id: number;
    name: string;
    questions: QuestionData[];
    timePerQuestion: number;
}
