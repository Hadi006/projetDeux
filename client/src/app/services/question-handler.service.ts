import { Injectable } from '@angular/core';
import { Answer, Question } from '@common/quiz';

@Injectable({
    providedIn: 'root',
})
export class QuestionHandlerService {
    currentQuestionIndex = 0;
    questions: Question[];

    getCurrentQuestion(): Question | undefined {
        return this.questions[this.currentQuestionIndex];
    }

    getCurrentAnswers(): Answer[] {
        return this.getCurrentQuestion()?.choices.filter((choice) => choice.isCorrect) || [];
    }
}
