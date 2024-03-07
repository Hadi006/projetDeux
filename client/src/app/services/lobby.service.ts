import { Injectable } from '@angular/core';
import { SocketService } from '@app/services/socket.service';
import { LobbyData } from '@common/lobby-data';
import { TEST_LOBBY_DATA } from '@common/constant';
import { GameHandlerService } from '@app/services/game-handler.service';

@Injectable({
    providedIn: 'root',
})
export class LobbyService {
    lobbyData: LobbyData;

    constructor(
        private readonly socketService: SocketService,
        private gameHandlerService: GameHandlerService,
    ) {
        this.lobbyData = TEST_LOBBY_DATA;
        this.lobbyData.quiz = this.gameHandlerService.quizData;
    }

    subscribeLobbyToServer() {
        this.socketService.filteredDataByType<LobbyData>('lobbyData').subscribe((data) => {
            if (this.lobbyData.id === data.id) {
                delete this.lobbyData.quiz;
                Object.assign(this.lobbyData, data);
            }
        });
    }
}
