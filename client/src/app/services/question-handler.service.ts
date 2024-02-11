import { Injectable, OnDestroy } from '@angular/core';
import { Answer, Question } from '@common/quiz';
import { Subscription } from 'rxjs';
import { GameStateService, GameState } from './game-state.service';
import { GameTimersService } from './game-timers.service';
import { PlayerHandlerService } from './player-handler.service';

export const GOOD_ANSWER_MULTIPLIER = 1.2;

@Injectable({
    providedIn: 'root',
})
export class QuestionHandlerService implements OnDestroy {
    private internalQuestions: Question[];
    private currentQuestionIndex = 0;
    private internalNQuestions: number = 0;
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

    get nQuestions(): number {
        return this.internalNQuestions;
    }

    set questionsData(data: Question[]) {
        this.internalQuestions = data;
        this.internalNQuestions = data.length;
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
        this.playerHandlerService.players.forEach((player) => {
            if (!this.currentQuestion) {
                return;
            }

            player.score += player.isCorrect ? this.currentQuestion.points * GOOD_ANSWER_MULTIPLIER : 0;
        });
    }

    ngOnDestroy(): void {
        this.timerEndedSubscription.unsubscribe();
    }

    private subscribeToTimerEnded(): void {
        this.timerEndedSubscription = this.gameTimersService.timerEndedSubject.subscribe(() => {
            if (this.gameStateService.gameState === GameState.ShowQuestion) {
                this.playerHandlerService.validatePlayerAnswers(this.currentQuestion?.id || '');
                this.updateScores();
            }
        });
    }
}
