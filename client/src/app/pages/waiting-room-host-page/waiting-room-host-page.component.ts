import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { HostService } from '@app/services/host.service';
import { START_GAME_COUNTDOWN } from '@common/constant';

@Component({
    selector: 'app-waiting-room-host-page',
    templateUrl: './waiting-room-host-page.component.html',
    styleUrls: ['./waiting-room-host-page.component.scss'],
})
export class WaitingRoomHostPageComponent {
    constructor(
        private hostService: HostService,
        private router: Router,
    ) {
        this.hostService.handleSockets();
    }

    get game() {
        return this.hostService.game;
    }

    startGame() {
        this.hostService.startGame(START_GAME_COUNTDOWN);
    }

    leaveGame() {
        this.hostService.cleanUp();
        this.router.navigate(['/']);
    }
}
