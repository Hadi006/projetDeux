import { Injectable, OnDestroy } from '@angular/core';
import { LobbyData } from '@common/lobby-data';
import { GameSocketsService } from './game-sockets.service';
import { LOBBY_ID_CHARACTERS, LOBBY_ID_LENGTH, NEW_LOBBY } from '@common/constant';
import { GameHandlerService } from '@app/services/game-handler.service';

@Injectable({
    providedIn: 'root',
})
export class LobbyService implements OnDestroy {
    private internalLobbyData: LobbyData;

    constructor(
        private gameSocketsService: GameSocketsService,
        private gameHandlerService: GameHandlerService,
    ) {
        this.createLobby();
    }

    get lobbyData() {
        return this.internalLobbyData;
    }

    createLobby() {
        this.internalLobbyData = {
            ...NEW_LOBBY,
            id: this.generateLobbyId(),
            quiz: this.gameHandlerService.quizData,
        };
    }

    ngOnDestroy() {
        this.gameSocketsService.disconnect();
    }

    private generateLobbyId(): string {
        let result = '';

        for (let i = 0; i < LOBBY_ID_LENGTH; i++) {
            result += LOBBY_ID_CHARACTERS.charAt(Math.floor(Math.random() * LOBBY_ID_CHARACTERS.length));
        }

        return result;
    }
}
