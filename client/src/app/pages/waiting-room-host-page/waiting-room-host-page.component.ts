import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { HostService } from '@app/services/host/host.service';
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
    ) {}

    get game() {
        return this.hostService.game;
    }

    ngOnInit() {
        if (!this.hostService.isConnected() || this.hostService.game.locked) {
            this.router.navigate(['/']);
        }
    }

    toggleLock() {
        this.hostService.toggleLock();
    }

    kick(player: string) {
        this.hostService.kick(player);
    }

    startGame() {
        this.router.navigate(['game-host']);
        this.hostService.startGame(START_GAME_COUNTDOWN);
    }
}
