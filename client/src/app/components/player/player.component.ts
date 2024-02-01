import { Component } from '@angular/core';
import { Player } from '@app/interfaces/player';

@Component({
    selector: 'app-player',
    templateUrl: './player.component.html',
    styleUrls: ['./player.component.scss'],
})
export class PlayerComponent {
    private internalPlayer: Player;

    get player(): Player {
        return this.internalPlayer;
    }
}
