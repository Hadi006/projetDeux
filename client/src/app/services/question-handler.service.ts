import { Injectable, OnDestroy } from '@angular/core';
import { GOOD_ANSWER_MULTIPLIER, GameState } from '@common/constant';
import { Answer, Question } from '@common/quiz';
import { Subscription } from 'rxjs';
import { GameStateService } from './game-state.service';
import { GameTimersService } from './game-timers.service';
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
        private gameTimersService: GameTimersService,
        private gameStateService: GameStateService,
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
        const nAnswers = this.currentQuestion?.choices.length || 0;
        this.playerHandlerService.resetPlayerAnswers(nAnswers);
    }

    nextQuestion(): void {
        this.currentQuestionIndex++;
        this.resetAnswers();
    }

    updateScores(): void {
        const points = (this.currentQuestion?.points || 0) * GOOD_ANSWER_MULTIPLIER;
        this.playerHandlerService.updateScores(points);
    }

    ngOnDestroy(): void {
        this.timerEndedSubscription.unsubscribe();
    }

    private subscribeToTimerEnded(): void {
        this.timerEndedSubscription = this.gameTimersService.timerEndedSubject.subscribe(() => {
            if (this.gameStateService.gameState === GameState.ShowQuestion) {
                this.playerHandlerService.validatePlayerAnswers(this.currentQuestion?.text || '').subscribe(() => {
                    this.updateScores();
                });
            }
        });
    }
}
