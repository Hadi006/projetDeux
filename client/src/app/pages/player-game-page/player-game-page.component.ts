import { Component } from '@angular/core';
import { PlayerService } from '@app/services/player.service';

@Component({
    selector: 'app-player-game-page',
    templateUrl: './player-game-page.component.html',
    styleUrls: ['./player-game-page.component.scss'],
})
export class PlayerGamePageComponent {
    isCountingDown = true;

    constructor(private playerService: PlayerService) {}

    stopCountDown() {
        this.isCountingDown = false;
    }

    gameTitle() {
        return this.playerService.gameTitle;
    }
}
