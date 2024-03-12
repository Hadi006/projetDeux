import { Injectable, OnDestroy } from '@angular/core';
import { Answer, Question } from '@common/quiz';
import { Subscription } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class QuestionHandlerService implements OnDestroy {
    currentQuestionIndex = 0;
    questions: Question[];

    private timerEndedSubscription: Subscription;

    get currentQuestion(): Question | undefined {
        return this.questions[this.currentQuestionIndex];
    }

    get currentAnswers(): Answer[] {
        return this.currentQuestion?.choices.filter((choice) => choice.isCorrect) || [];
    }

    ngOnDestroy(): void {
        this.timerEndedSubscription.unsubscribe();
    }
}
