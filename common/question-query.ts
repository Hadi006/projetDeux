import { Answer } from "@common/quiz";
import { QuestionType } from "./constant";

export interface QuestionQuery {
    text?: string;
    type?: 'QCM' | 'QRL' | '' | QuestionType;
    points?: number;
    lastModification?: Date;
    choices?: Answer[];
}
