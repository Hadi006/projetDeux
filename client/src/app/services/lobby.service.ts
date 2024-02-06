import { Injectable } from '@angular/core';
import { SocketService } from '@app/services/socket.service';
import { LobbyData } from '@common/lobby-data';

@Injectable({
    providedIn: 'root',
})
export class LobbyService {
    constructor(private readonly socketService: SocketService) {}

    subscribeToLobbyDataById(id: number, lobbyData: LobbyData) {
        this.socketService.filteredDataByType<LobbyData>('lobbyData').subscribe((data) => {
            if (id === lobbyData.id) {
                lobbyData = data;
            }
        });
    }
}
