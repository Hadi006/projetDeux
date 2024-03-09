import { Injectable } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { environment } from 'src/environments/environment';
import { Acknowledgment } from '@common/acknowledgment';

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

    async createLobby(lobbyId: string): Promise<boolean> {
        let result = false;

        this.socket.emit('create-lobby', lobbyId, (ack: Acknowledgment) => {
            if (ack.success) {
                this.joinLobby(lobbyId);
                result = true;
            }
        });

        return result;
    }

    joinLobby(roomId: string) {
        this.socket.emit('join-lobby', roomId);
    }
}
