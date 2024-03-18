import { Question } from '@common/question';

export interface QuestionChangedEventData {
    question: Question;
    countdown: number;
}
