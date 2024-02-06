import { Injectable } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { SocketService } from '@app/services/socket.service';
import { LobbyData } from '@common/lobby-data';

@Injectable({
    providedIn: 'root',
})
export class LobbyService {
    lobbyId: number;
    lobbyData: LobbyData;

    constructor(
        private readonly route: ActivatedRoute,
        private readonly socketService: SocketService,
    ) {
        this.lobbyId = this.route.snapshot.params.id;
    }
}
