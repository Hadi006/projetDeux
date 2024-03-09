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

    createLobby(quiz: Quiz): Observable<LobbyData | undefined> {
        return new Observable<LobbyData | undefined>((subscriber) => {
            this.socket.emit('create-lobby', quiz, (lobbyData: LobbyData | undefined) => {
                if (!lobbyData) {
                    subscriber.next(undefined);
                    subscriber.complete();
                    return;
                } else {
                    this.joinLobby(lobbyData.id);
                    subscriber.next(lobbyData);
                    subscriber.complete();
                }
            });
        });
    }

    joinLobby(roomId: string): Observable<string> {
        return new Observable<string>((subscriber) => {
            this.socket.emit('join-lobby', roomId, (errorMsg: string) => {
                subscriber.next(errorMsg);
                subscriber.complete();
            });
        });
    }

    deleteLobby(roomId: string): Observable<void> {
        return new Observable<void>((subscriber) => {
            this.socket.emit('delete-lobby', roomId, () => {
                subscriber.next();
                subscriber.complete();
            });
        });
    }
}
