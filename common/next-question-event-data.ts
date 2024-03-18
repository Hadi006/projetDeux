import { Question } from '@common/question';
import { HistogramData } from '@common/histogram-data';

export interface NextQuestionEventData {
    question: Question,
    countdown: number,
    histogram: HistogramData
}
