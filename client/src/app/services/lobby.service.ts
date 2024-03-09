import { Injectable } from '@angular/core';
import { LobbyData } from '@common/lobby-data';
import { GameSocketsService } from './game-sockets.service';
import { GameHandlerService } from '@app/services/game-handler.service';

@Injectable({
    providedIn: 'root',
})
export class LobbyService {
    private internalLobbyData: LobbyData;

    constructor(
        private gameSocketsService: GameSocketsService,
        private gameHandlerService: GameHandlerService,
    ) {}

    get lobbyData() {
        return this.internalLobbyData;
    }

    createLobby() {
        if (!this.gameHandlerService.quizData) {
            return;
        }

        this.gameSocketsService.connect();
        this.gameSocketsService.createLobby(this.gameHandlerService.quizData).subscribe((lobbyData: LobbyData) => {
            this.internalLobbyData = lobbyData;
        });
    }

    cleanUp() {
        this.gameSocketsService.disconnect();
        this.gameHandlerService.cleanUp();
    }
}
