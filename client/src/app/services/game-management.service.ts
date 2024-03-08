import { Injectable, OnDestroy } from '@angular/core';
import { TimeService } from '@app/services/time.service';
import { GameState } from '@common/constant';
import { Subject, Subscription } from 'rxjs';
import { PlayerHandlerService } from './player-handler.service';

@Injectable({
    providedIn: 'root',
})
export class GameManagementService implements OnDestroy {
    gameState: GameState = GameState.ShowQuestion;

    private questionTimerId: number;
    private answerTimerId: number;
    private internalTimerEndedSubject: Subject<void> = new Subject<void>();
    private internalAllAnsweredSubscription: Subscription;

    constructor(
        private timeService: TimeService,
        private playerHandlerService: PlayerHandlerService,
    ) {
        this.questionTimerId = this.timeService.createTimerById(this.stopQuestionTimer.bind(this));
        this.answerTimerId = this.timeService.createTimerById(this.stopAnswerTimer.bind(this));
        this.internalAllAnsweredSubscription = this.playerHandlerService.allAnsweredSubject.subscribe(() => {
            this.stopQuestionTimer();
        });
    }

    get time(): number {
        switch (this.gameState) {
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

    resetTimers(): void {
        this.timeService.stopTimerById(this.questionTimerId);
        this.timeService.stopTimerById(this.answerTimerId);
    }

    ngOnDestroy(): void {
        this.internalAllAnsweredSubscription.unsubscribe();
    }
}
