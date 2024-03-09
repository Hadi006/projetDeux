import { Injectable } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { environment } from 'src/environments/environment';
import { Observable } from 'rxjs';
import { LobbyData } from '@common/lobby-data';
import { Quiz } from '@common/quiz';

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

    createLobby(quiz: Quiz): Observable<void> {
        return new Observable<void>((subscriber) => {
            this.socket.emit('create-lobby', quiz, (lobbyData: LobbyData) => {
                this.joinLobby(lobbyData.id);
                subscriber.next();
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
