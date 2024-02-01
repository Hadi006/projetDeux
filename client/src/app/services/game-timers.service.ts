import { Injectable } from '@angular/core';
import { TimeService } from '@app/services/time.service';
import { GameStateService } from './game-state.service';

@Injectable({
    providedIn: 'root',
})
export class GameTimersService {
    private questionTimerId: number;
    private answerTimerId: number;

    constructor(
        private timeService: TimeService,
        private gameStateService: GameStateService,
    ) {}

    get time(): number {
        switch (this.gameStateService.gameState) {
            case 0:
                return this.timeService.getTime(this.questionTimerId);
            case 1:
                return this.timeService.getTime(this.answerTimerId);
            default:
                return 0;
        }
    }
}
