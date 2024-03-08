import { Injectable, OnDestroy } from '@angular/core';
import { SocketService } from '@app/services/socket.service';
import { LobbyData } from '@common/lobby-data';
import { GameSocketsService } from './game-sockets.service';

@Injectable({
    providedIn: 'root',
})
export class LobbyService implements OnDestroy {
    constructor(
        private readonly socketService: SocketService,
        private gameSocketsService: GameSocketsService,
    ) {
        this.gameSocketsService.connect();
    }

    subscribeLobbyToServer(lobbyData: LobbyData) {
        this.socketService.filteredDataByType<LobbyData>('lobbyData').subscribe((data) => {
            if (lobbyData.id === data.id) {
                delete lobbyData.quiz;
                Object.assign(lobbyData, data);
            }
        });
    }

    ngOnDestroy() {
        this.gameSocketsService.disconnect();
    }
}
