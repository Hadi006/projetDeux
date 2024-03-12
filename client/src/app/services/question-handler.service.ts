import { Injectable } from '@angular/core';
import { Answer, Question } from '@common/quiz';

@Injectable({
    providedIn: 'root',
})
export class QuestionHandlerService {
    currentQuestionIndex = 0;
    questions: Question[];

    get currentQuestion(): Question | undefined {
        return this.questions[this.currentQuestionIndex];
    }

    get currentAnswers(): Answer[] {
        return this.currentQuestion?.choices.filter((choice) => choice.isCorrect) || [];
    }
}
