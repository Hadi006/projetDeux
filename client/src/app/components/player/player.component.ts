import { Component } from '@angular/core';
import { Player } from '@app/interfaces/player';
import { PlayerHandlerService } from '@app/services/player-handler.service';

@Component({
    selector: 'app-player',
    templateUrl: './player.component.html',
    styleUrls: ['./player.component.scss'],
})
export class PlayerComponent {
    private internalPlayer: Player;

    constructor(private playerHandlerService: PlayerHandlerService) {
        this.internalPlayer = this.playerHandlerService.createPlayer();
    }

    get player(): Player {
        return this.internalPlayer;
    }
}
