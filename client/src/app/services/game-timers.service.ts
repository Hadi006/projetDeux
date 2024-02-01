import { Injectable } from '@angular/core';
import { TimeService } from '@app/services/time.service';
import { GameStateService, GameState } from './game-state.service';

export const QUESTION_DELAY = 5;
export const ANSWER_DELAY = 3;

@Injectable({
    providedIn: 'root',
})
export class GameTimersService {
    private questionTimerId: number;
    private answerTimerId: number;

    constructor(
        private timeService: TimeService,
        private gameStateService: GameStateService,
    ) {
        this.questionTimerId = this.timeService.createTimer(this.internalQuestionTimerCallback.bind(this));
        this.answerTimerId = this.timeService.createTimer(this.internalAnswerTimerCallback.bind(this));
    }

    get time(): number {
        switch (this.gameStateService.gameState) {
            case GameState.ShowQuestion:
                return this.timeService.getTime(this.questionTimerId);
            case GameState.ShowAnswer:
                return this.timeService.getTime(this.answerTimerId);
            default:
                return 0;
        }
    }
    startQuestionTimer(time: number): void {
        this.timeService.startTimer(this.questionTimerId, time);
    }

    startAnswerTimer(time: number): void {
        this.timeService.startTimer(this.answerTimerId, time);
    }

    internalQuestionTimerCallback(): void {
        this.gameStateService.nextState();
        this.startAnswerTimer(ANSWER_DELAY);
    }

    internalAnswerTimerCallback(): void {
        this.gameStateService.nextState();
        this.startQuestionTimer(QUESTION_DELAY);
    }
}
