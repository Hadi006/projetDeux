import { Injectable } from '@angular/core';
import { QuestionHandlerService } from './question-handler.service';

export const GOOD_ANSWER_MULTIPLIER = 1.2;

@Injectable({
    providedIn: 'root',
})
export class ScoreService {
    constructor(private questionHandlerService: QuestionHandlerService) {}

    calculateScore(isChecked: boolean[]): number {
        if (!this.questionHandlerService.currentQuestion) {
            return 0;
        }

        const score = this.questionHandlerService.currentQuestion.points * GOOD_ANSWER_MULTIPLIER;

        return this.questionHandlerService.isAnswerCorrect(isChecked) ? score : 0;
    }
}
