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

    createLobby(): boolean {
        if (!this.gameHandlerService.quizData) {
            return false;
        }

        this.gameSocketsService.connect();
        this.gameSocketsService.createLobby(this.gameHandlerService.quizData).subscribe((lobbyData: LobbyData | null) => {
            if (lobbyData) {
                this.internalLobbyData = lobbyData;
            }
        });

        return true;
    }

    cleanUp() {
        this.gameSocketsService.deleteLobby(this.internalLobbyData.id).subscribe();
        this.gameSocketsService.disconnect();
        this.gameHandlerService.cleanUp();
    }
}
