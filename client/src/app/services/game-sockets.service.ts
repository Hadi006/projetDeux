import { Injectable } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { environment } from 'src/environments/environment';
import { Acknowledgment } from '@common/acknowledgment';
import { Observable } from 'rxjs';
import { LobbyData } from '@common/lobby-data';

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

    createLobby(lobbyData: LobbyData): Observable<boolean> {
        return new Observable<boolean>((subscriber) => {
            this.socket.emit('create-lobby', lobbyData, (ack: Acknowledgment) => {
                if (ack.success) {
                    this.joinLobby(lobbyData.id);
                    subscriber.next(true);
                } else {
                    subscriber.next(false);
                }
                subscriber.complete();
            });
        });
    }

    joinLobby(roomId: string): Observable<boolean> {
        return new Observable<boolean>((subscriber) => {
            this.socket.emit('join-lobby', roomId, (ack: Acknowledgment) => {
                subscriber.next(ack.success);
                subscriber.complete();
            });
        });
    }
}
