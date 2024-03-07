import { Component } from '@angular/core';
import { LobbyService } from '@app/services/lobby.service';

@Component({
    selector: 'app-lobby-organizer-page',
    templateUrl: './lobby-organizer-page.component.html',
    styleUrls: ['./lobby-organizer-page.component.scss'],
})
export class LobbyOrganizerPageComponent {
    constructor(public lobbyService: LobbyService) {
        this.lobbyService.subscribeLobbyToServer();
    }

    startGame() {
        this.lobbyService.lobbyData.started = true;
    }
}
