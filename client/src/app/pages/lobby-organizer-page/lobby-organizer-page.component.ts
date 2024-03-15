import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { HostService } from '@app/services/host.service';
import { START_GAME_COUNTDOWN } from '@common/constant';

@Component({
    selector: 'app-lobby-organizer-page',
    templateUrl: './lobby-organizer-page.component.html',
    styleUrls: ['./lobby-organizer-page.component.scss'],
})
export class LobbyOrganizerPageComponent {
    constructor(
        private hostService: HostService,
        private router: Router,
    ) {
        this.hostService.handleSockets();
    }

    get lobbyData() {
        return this.hostService.lobbyData;
    }

    startGame() {
        this.hostService.startGame(START_GAME_COUNTDOWN);
    }

    leaveLobby() {
        this.hostService.cleanUp();
        this.router.navigate(['/']);
    }
}
