import { Injectable, OnDestroy } from '@angular/core';
import { TimeService } from '@app/services/time.service';
import { GameStateService, GameState } from '@app/services/game-state.service';
import { Subject, Subscription } from 'rxjs';
import { PlayerHandlerService } from './player-handler.service';

@Injectable({
    providedIn: 'root',
})
export class GameTimersService implements OnDestroy {
    private questionTimerId: number;
    private answerTimerId: number;
    private internalTimerEndedSubject: Subject<void> = new Subject<void>();
    private internalAllAnsweredSubscription: Subscription;

    constructor(
        private timeService: TimeService,
        private gameStateService: GameStateService,
        private playerHandlerService: PlayerHandlerService,
    ) {
        this.questionTimerId = this.timeService.createTimerById(this.stopQuestionTimer.bind(this));
        this.answerTimerId = this.timeService.createTimerById(this.stopAnswerTimer.bind(this));
        this.internalAllAnsweredSubscription = this.playerHandlerService.allAnsweredSubject.subscribe(() => {
            this.stopQuestionTimer();
        });
    }

    get time(): number {
        switch (this.gameStateService.gameState) {
            case GameState.ShowQuestion:
                return this.timeService.getTimeById(this.questionTimerId);
            case GameState.ShowAnswer:
                return this.timeService.getTimeById(this.answerTimerId);
            default:
                return 0;
        }
    }

    get timerEndedSubject(): Subject<void> {
        return this.internalTimerEndedSubject;
    }

    startQuestionTimer(time: number): void {
        this.timeService.startTimerById(this.questionTimerId, time);
    }

    startAnswerTimer(time: number): void {
        this.timeService.startTimerById(this.answerTimerId, time);
    }

    stopQuestionTimer(): void {
        this.timeService.stopTimerById(this.questionTimerId);
        this.internalTimerEndedSubject.next();
    }

    stopAnswerTimer(): void {
        this.timeService.stopTimerById(this.answerTimerId);
        this.internalTimerEndedSubject.next();
    }

    ngOnDestroy(): void {
        this.internalAllAnsweredSubscription.unsubscribe();
    }
}
