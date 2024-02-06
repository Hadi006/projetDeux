import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { LobbyService } from '@app/services/lobby.service';
import { LobbyData } from '@common/lobby-data';

@Component({
    selector: 'app-lobby-organizer-page',
    templateUrl: './lobby-organizer-page.component.html',
    styleUrls: ['./lobby-organizer-page.component.scss'],
})
export class LobbyOrganizerPageComponent {
    lobbyId: number;
    lobbyData: LobbyData;

    constructor(
        private readonly route: ActivatedRoute,
        private readonly lobbyService: LobbyService,
    ) {
        this.lobbyId = this.route.snapshot.params.id;
        this.lobbyService.subscribeToLobbyDataById(this.lobbyId, this.lobbyData);
    }

    startGame() {
        this.lobbyData.started = true;
    }
}
