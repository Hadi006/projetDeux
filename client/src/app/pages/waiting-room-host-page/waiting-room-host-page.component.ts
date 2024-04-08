import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { HostService } from '@app/services/host/host.service';
import { PlayerService } from '@app/services/player/player.service';
import { START_GAME_COUNTDOWN } from '@common/constant';

@Component({
    selector: 'app-waiting-room-host-page',
    templateUrl: './waiting-room-host-page.component.html',
    styleUrls: ['./waiting-room-host-page.component.scss'],
})
export class WaitingRoomHostPageComponent implements OnInit {
    constructor(
        private hostService: HostService,
        private router: Router,
        private playerService: PlayerService,
    ) {}

    get game() {
        return this.hostService.game;
    }

    ngOnInit() {
        if (!this.hostService.isConnected() || !this.hostService.game || this.hostService.game.locked) {
            this.router.navigate(['/']);
            return;
        }

        if (this.hostService.game.quiz.id === '-1') {
            this.playerService.handleSockets();
            this.playerService.joinGame(this.hostService.game.pin, { playerName: 'Organisateur', isHost: true }).subscribe((error) => {
                if (error) {
                    this.hostService.cleanUp();
                    this.playerService.cleanUp();
                    this.router.navigate(['/']);
                }
            });
        }
    }

    toggleLock() {
        this.hostService.toggleLock();
    }

    kick(player: string) {
        this.hostService.kick(player);
    }

    startGame() {
        if (!this.hostService.game) {
            return;
        }

        if (this.hostService.game.quiz.id === '-1') {
            this.router.navigate(['host-player']);
        } else {
            this.router.navigate(['game-host']);
            this.hostService.startGame(START_GAME_COUNTDOWN);
        }
    }
}
