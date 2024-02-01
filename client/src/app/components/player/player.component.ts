import { Component } from '@angular/core';
import { PlayerHandlerService } from '@app/services/player-handler.service';

@Component({
    selector: 'app-player',
    templateUrl: './player.component.html',
    styleUrls: ['./player.component.scss'],
})
export class PlayerComponent {
    player;

    constructor(private playerHandlerService: PlayerHandlerService) {
        this.player = this.playerHandlerService.createPlayer();
    }
}
