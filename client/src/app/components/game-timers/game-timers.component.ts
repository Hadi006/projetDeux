import { Component } from '@angular/core';
import { PlayerService } from '@app/services/player.service';

@Component({
    selector: 'app-game-timers',
    templateUrl: './game-timers.component.html',
    styleUrls: ['./game-timers.component.scss'],
})
export class GameTimersComponent {
    constructor(public playerService: PlayerService) {}
}
