import { Component } from '@angular/core';
import { GameStateService, GameState } from '@app/services/game-state.service';
import { GameTimersService } from '@app/services/game-timers.service';

@Component({
    selector: 'app-game-timers',
    templateUrl: './game-timers.component.html',
    styleUrls: ['./game-timers.component.scss'],
})
export class GameTimersComponent {
    constructor(
        private gameTimersService: GameTimersService,
        private gameStateService: GameStateService,
    ) {}
}
