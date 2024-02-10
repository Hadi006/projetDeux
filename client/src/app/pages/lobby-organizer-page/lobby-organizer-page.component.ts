import { Component } from '@angular/core';
import { GameHandlerService } from '@app/services/game-handler.service';
import { LobbyService } from '@app/services/lobby.service';
import { LobbyData } from '@common/lobby-data';

const TEST_PLAYER_DATA = [
    { id: 1, name: 'Player 1' },
    { id: 2, name: 'Player 2' },
];
export const TEST_LOBBY_DATA: LobbyData = {
    id: 1,
    players: TEST_PLAYER_DATA,
    started: false,
};

@Component({
    selector: 'app-lobby-organizer-page',
    templateUrl: './lobby-organizer-page.component.html',
    styleUrls: ['./lobby-organizer-page.component.scss'],
})
export class LobbyOrganizerPageComponent {
    lobbyData: LobbyData;

    constructor(
        private readonly lobbyService: LobbyService,
        private gameHandlerService: GameHandlerService,
    ) {
        this.lobbyData = TEST_LOBBY_DATA;
        this.lobbyData.game = this.gameHandlerService.gameData;
        this.lobbyService.subscribeLobbyToServer(this.lobbyData);
    }

    startGame() {
        this.lobbyData.started = true;
    }
}
