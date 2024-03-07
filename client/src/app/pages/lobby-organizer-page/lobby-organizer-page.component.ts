import { Component } from '@angular/core';
import { GameHandlerService } from '@app/services/game-handler.service';
import { LobbyService } from '@app/services/lobby.service';
import { LobbyData } from '@common/lobby-data';
import { TEST_LOBBY_DATA } from '@common/constant';

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
        this.lobbyData.quiz = this.gameHandlerService.quizData;
    }

    startGame() {
        this.lobbyData.started = true;
    }
}
