import { Injectable, OnDestroy } from '@angular/core';
import { GOOD_ANSWER_MULTIPLIER, GameState } from '@common/constant';
import { Answer, Question } from '@common/quiz';
import { Subscription } from 'rxjs';
import { GameManagementService } from './game-management.service';
import { PlayerHandlerService } from './player-handler.service';

@Injectable({
    providedIn: 'root',
})
export class QuestionHandlerService implements OnDestroy {
    private internalQuestions: Question[];
    private currentQuestionIndex = 0;
    private timerEndedSubscription: Subscription;

    constructor(
        private playerHandlerService: PlayerHandlerService,
        private gameManagementService: GameManagementService,
    ) {
        this.subscribeToTimerEnded();
    }

    get currentQuestion(): Question | undefined {
        return this.internalQuestions[this.currentQuestionIndex];
    }

    get currentAnswers(): Answer[] {
        return this.currentQuestion?.choices.filter((choice) => choice.isCorrect) || [];
    }

    set questionsData(data: Question[]) {
        this.internalQuestions = data;
        this.currentQuestionIndex = 0;
    }

    resetAnswers(): void {
        if (!this.currentQuestion) {
            return;
        }

        this.playerHandlerService.resetPlayerAnswers(this.currentQuestion);
    }

    nextQuestion(): void {
        this.currentQuestionIndex++;
        this.resetAnswers();
    }

    ngOnDestroy(): void {
        this.timerEndedSubscription.unsubscribe();
    }

    private subscribeToTimerEnded(): void {
        this.timerEndedSubscription = this.gameManagementService.timerEndedSubject.subscribe(() => {
            if (this.gameManagementService.gameState === GameState.ShowQuestion) {
                this.playerHandlerService.validatePlayerAnswers(this.currentQuestion?.text || '', this.calculateQuestionPoints());
            }
        });
    }

    private calculateQuestionPoints(): number {
        return (this.currentQuestion?.points || 0) * GOOD_ANSWER_MULTIPLIER;
    }
}
