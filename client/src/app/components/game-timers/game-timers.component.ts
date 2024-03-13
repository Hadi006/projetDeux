import { Component } from '@angular/core';
import { PlayerHandlerService } from '@app/services/player-handler.service';

@Component({
    selector: 'app-game-timers',
    templateUrl: './game-timers.component.html',
    styleUrls: ['./game-timers.component.scss'],
})
export class GameTimersComponent {
    constructor(public playerHandlerService: PlayerHandlerService) {}
}
