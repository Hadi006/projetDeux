import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { PlayerService } from '@app/services/player.service';

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
        private router: Router,
        private playerService: PlayerService,
    ) {}

    joinGame() {
        this.playerService.joinGame(this.gamePin, this.playerName).subscribe((error: string) => {
            this.error = error;
            if (error) {
                return;
            }
            this.router.navigate(['/home/player-lobby']);
        });
    }
}

