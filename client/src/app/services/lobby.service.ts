import { Injectable } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { SocketService } from '@app/services/socket.service';
import { LobbyData } from '@common/lobby-data';

const testPlayersData = [
    { id: 1, name: 'Player 1' },
    { id: 2, name: 'Player 2' },
];
const testGameData = { id: 1, name: 'Math' };
const testLobbyData: LobbyData = {
    id: 1,
    players: testPlayersData,
    game: testGameData,
    started: false,
};

@Injectable({
    providedIn: 'root',
})
export class LobbyService {
    lobbyData: LobbyData;

    constructor(
        private readonly socketService: SocketService,
    ) {
    }

    subscribeToLobbyDataById(id: number) {
        this.socketService.filteredDataByType<LobbyData>('lobbyData').subscribe((lobbyData) => {
            if (id === lobbyData.id) {
                this.lobbyData = lobbyData;
            }
        });
    }
}
