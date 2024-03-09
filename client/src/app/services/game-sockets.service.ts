import { Injectable } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { environment } from 'src/environments/environment';

@Injectable({
    providedIn: 'root',
})
export class GameSocketsService {
    private socket: Socket;

    connect() {
        this.socket = io(environment.serverUrl, { transports: ['websocket'], upgrade: false });
    }

    disconnect() {
        this.socket.disconnect();
    }

    createLobby(lobbyId: string) {
        this.socket.emit('create-lobby', lobbyId);
        this.joinLobby(lobbyId);
    }

    joinLobby(roomId: string) {
        this.socket.emit('join-lobby', roomId);
    }
}
