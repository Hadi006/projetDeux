import { Question } from '@common/quiz';

export interface QuestionChangedEventData {
    question: Question;
    countdown: number;
}
