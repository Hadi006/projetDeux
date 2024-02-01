import { Injectable } from '@angular/core';
import { TimeService } from '@app/services/time.service';
import { GameStateService, GameState } from '@app/services/game-state.service';
import { Subject } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class GameTimersService {
    private questionTimerId: number;
    private answerTimerId: number;
    private internalTimerEndedSubject: Subject<void> = new Subject<void>();

    constructor(
        private timeService: TimeService,
        private gameStateService: GameStateService,
    ) {
        this.questionTimerId = this.timeService.createTimer(this.stopQuestionTimer.bind(this));
        this.answerTimerId = this.timeService.createTimer(this.stopAnswerTimer.bind(this));
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

    get timerEndedSubject(): Subject<void> {
        return this.internalTimerEndedSubject;
    }

    startQuestionTimer(time: number): void {
        this.timeService.startTimer(this.questionTimerId, time);
    }

    startAnswerTimer(time: number): void {
        this.timeService.startTimer(this.answerTimerId, time);
    }

    stopQuestionTimer(): void {
        this.timeService.stopTimer(this.questionTimerId);
        this.timerEndedSubject.next();
    }

    stopAnswerTimer(): void {
        this.timeService.stopTimer(this.answerTimerId);
        this.timerEndedSubject.next();
    }
}
