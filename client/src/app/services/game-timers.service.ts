import { Injectable } from '@angular/core';
import { TimeService } from '@app/services/time.service';
import { GameStateService, GameState } from '@app/services/game-state.service';
import { Subject, Subscription } from 'rxjs';
import { PlayerHandlerService } from './player-handler.service';

@Injectable({
    providedIn: 'root',
})
export class GameTimersService {
    private questionTimerId: number;
    private answerTimerId: number;
    private internalTimerEndedSubject: Subject<void> = new Subject<void>();
    private internalAllAnsweredSubscription: Subscription;

    constructor(
        private timeService: TimeService,
        private gameStateService: GameStateService,
        private playerHandlerService: PlayerHandlerService,
    ) {
        this.questionTimerId = this.timeService.createTimer(this.stopQuestionTimer.bind(this));
        this.answerTimerId = this.timeService.createTimer(this.stopAnswerTimer.bind(this));
        this.internalAllAnsweredSubscription = this.playerHandlerService.allAnsweredSubject.subscribe(() => {
            this.stopQuestionTimer();
        });
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
        this.internalTimerEndedSubject.next();
    }

    stopAnswerTimer(): void {
        this.timeService.stopTimer(this.answerTimerId);
        this.internalTimerEndedSubject.next();
    }

    cleanUp(): void {
        this.internalAllAnsweredSubscription.unsubscribe();
    }
}
