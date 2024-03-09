import { Injectable } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { environment } from 'src/environments/environment';
import { Acknowledgment } from '@common/acknowledgment';
import { Observable } from 'rxjs';

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

    createLobby(lobbyId: string): Observable<boolean> {
        return new Observable<boolean>((subscriber) => {
            this.socket.emit('create-lobby', lobbyId, (ack: Acknowledgment) => {
                if (ack.success) {
                    this.joinLobby(lobbyId);
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
