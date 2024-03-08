import { Injectable, OnDestroy } from '@angular/core';
import { SocketService } from '@app/services/socket.service';
import { LobbyData } from '@common/lobby-data';
import { GameSocketsService } from './game-sockets.service';
import { TEST_LOBBY_DATA } from '@common/constant';
import { GameHandlerService } from '@app/services/game-handler.service';

@Injectable({
    providedIn: 'root',
})
export class LobbyService implements OnDestroy {
    private internalLobbyData: LobbyData;

    constructor(
        private readonly socketService: SocketService,
        private gameSocketsService: GameSocketsService,
        private gameHandlerService: GameHandlerService,
    ) {
        this.internalLobbyData = TEST_LOBBY_DATA;
        this.internalLobbyData.quiz = this.gameHandlerService.quizData;
    }

    get lobbyData() {
        return this.internalLobbyData;
    }

    subscribeLobbyToServer() {
        this.socketService.filteredDataByType<LobbyData>('lobbyData').subscribe((data) => {
            if (this.internalLobbyData.id === data.id) {
                delete this.internalLobbyData.quiz;
                Object.assign(this.internalLobbyData, data);
            }
        });
    }

    ngOnDestroy() {
        this.gameSocketsService.disconnect();
    }
}
