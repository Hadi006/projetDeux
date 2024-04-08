import { Question } from "@common/quiz";

export interface QuizQuery {
    id?: string;
    title?: string;
    visible?: boolean;
    description?: string;
    duration?: number;
    lastModification?: Date;
    questions?: Question[];
}
