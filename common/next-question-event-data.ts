import { Question } from '@common/quiz';
import { HistogramData } from '@common/histogram-data';

export interface NextQuestionEventData {
    question?: Question,
    countdown: number,
    histogram: HistogramData
}
