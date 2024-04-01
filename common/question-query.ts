import { Answer } from "@common/quiz";

export interface QuestionQuery {
    text?: string;
    type?: 'QCM' | 'QRL' | '';
    points?: number;
    lastModification?: Date;
    choices?: Answer[];
}
