import { Component } from '@angular/core';
import { HostService } from '@app/services/host.service';

@Component({
    selector: 'app-lobby-organizer-page',
    templateUrl: './lobby-organizer-page.component.html',
    styleUrls: ['./lobby-organizer-page.component.scss'],
})
export class LobbyOrganizerPageComponent {
    constructor(public hostService: HostService) {
        this.hostService.handleSockets();
    }

    get lobbyData() {
        return this.hostService.lobbyData;
    }

    startGame() {
        this.hostService.startGame();
    }

    leaveLobby() {
        this.hostService.cleanUp();
    }
}
