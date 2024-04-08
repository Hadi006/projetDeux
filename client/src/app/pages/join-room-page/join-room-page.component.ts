import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { PlayerService } from '@app/services/player/player.service';

@Component({
    selector: 'app-join-room-page',
    templateUrl: './join-room-page.component.html',
    styleUrls: ['./join-room-page.component.scss'],
})
export class JoinRoomPageComponent {
    gamePin: string = '';
    playerName: string = '';
    error: string = '';

    constructor(
        private playerService: PlayerService,
        private router: Router,
    ) {}

    joinGame() {
        this.playerService.handleSockets();
        this.playerService.joinGame(this.gamePin, { playerName: this.playerName, isHost: false }).subscribe((error: string) => {
            this.error = error;
            if (error) {
                return;
            }

            this.router.navigate(['waiting-room-player']);
        });
    }

    return() {
        this.playerService.cleanUp();
        this.router.navigate(['/']);
    }
}
