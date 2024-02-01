import { Injectable } from '@angular/core';
import { Subscription } from 'rxjs';
import { GameTimersService } from './game-timers.service';
import { PlayerHandlerService } from './player-handler.service';
import { QuestionHandlerService } from './question-handler.service';

export const GOOD_ANSWER_MULTIPLIER = 1.2;

@Injectable({
    providedIn: 'root',
})
export class ScoreService {
    private timerEndedSubscription: Subscription;

    constructor(
        private questionHandlerService: QuestionHandlerService,
        private playerHandlerService: PlayerHandlerService,
        private gameTimersService: GameTimersService,
    ) {
        this.subscribeToTimerEnded();
    }

    updateScores(): void {
        this.playerHandlerService.players.forEach((player) => {
            player.score += this.calculateScore(player.answer);
        });
    }

    calculateScore(isChecked: boolean[]): number {
        if (!this.questionHandlerService.currentQuestion) {
            return 0;
        }

        const score = this.questionHandlerService.currentQuestion.points * GOOD_ANSWER_MULTIPLIER;

        return this.questionHandlerService.isAnswerCorrect(isChecked) ? score : 0;
    }

    cleanUp(): void {
        this.timerEndedSubscription.unsubscribe();
    }

    private subscribeToTimerEnded(): void {
        this.timerEndedSubscription = this.gameTimersService.timerEndedSubject.subscribe(() => {
            this.updateScores();
        });
    }
}
