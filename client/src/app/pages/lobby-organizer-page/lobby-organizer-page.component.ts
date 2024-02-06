import { Component, Input } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { LobbyService } from '@app/services/lobby.service';
import { LobbyData } from '@common/lobby-data';

const TEST_PLAYER_DATA = [
    { id: 1, name: 'Player 1' },
    { id: 2, name: 'Player 2' },
];
const TEST_GAME_DATA = { id: 1, name: 'Math' };
const TEST_LOBBY_DATA: LobbyData = {
    id: 1,
    players: TEST_PLAYER_DATA,
    game: TEST_GAME_DATA,
    started: false,
};

@Component({
    selector: 'app-lobby-organizer-page',
    templateUrl: './lobby-organizer-page.component.html',
    styleUrls: ['./lobby-organizer-page.component.scss'],
})
export class LobbyOrganizerPageComponent {
    @Input() lobbyId: number;
    lobbyData: LobbyData;

    constructor(
        private readonly route: ActivatedRoute,
        private readonly lobbyService: LobbyService,
    ) {
        this.lobbyId = this.route.snapshot.params.id;
        this.lobbyService.subscribeToLobbyDataById(this.lobbyId, this.lobbyData);
        // TODO hard coded data for the moment
        this.lobbyData = TEST_LOBBY_DATA;
    }

    startGame() {
        this.lobbyData.started = true;
    }
}
