import { Injectable } from '@angular/core';
import { TimeService } from '@app/services/time.service';
import { GameStateService, GameState } from './game-state.service';

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
        this.questionTimerId = this.timeService.createTimer();
        this.answerTimerId = this.timeService.createTimer();
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

    private internalQuestionTimerCallback(): void {
        this.gameStateService.nextState();
        this.startAnswerTimer(0);
    }

    private internalAnswerTimerCallback(): void {
        this.gameStateService.nextState();
        this.startQuestionTimer(0);
    }
}
