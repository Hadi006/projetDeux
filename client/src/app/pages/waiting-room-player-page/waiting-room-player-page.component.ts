import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { PlayerService } from '@app/services/player.service';

@Component({
    selector: 'app-waiting-room-player-page',
    templateUrl: './waiting-room-player-page.component.html',
    styleUrls: ['./waiting-room-player-page.component.scss'],
})
export class WaitingRoomPlayerPageComponent {
    constructor(
        private playerService: PlayerService,
        private router: Router,
    ) {}

    get pin() {
        return this.playerService.pin;
    }

    get gameTitle() {
        return this.playerService.gameTitle;
    }

    get players() {
        return this.playerService.players;
    }

    leaveGame() {
        this.playerService.cleanUp();
        this.router.navigate(['/']);
    }
}
