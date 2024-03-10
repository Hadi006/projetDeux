import { Injectable } from '@angular/core';
import { LobbyData } from '@common/lobby-data';
import { GameHandlerService } from '@app/services/game-handler.service';
import { WebSocketService } from './web-socket.service';
import { Observable, of } from 'rxjs';
import { Router } from '@angular/router';

@Injectable({
    providedIn: 'root',
})
export class HostService {
    private internalLobbyData: LobbyData;

    constructor(
        private webSocketService: WebSocketService,
        private gameHandlerService: GameHandlerService,
        private router: Router,
    ) {}

    get lobbyData() {
        return this.internalLobbyData;
    }

    handleSockets() {
        this.webSocketService.connect();
        this.onStartGame();
    }

    createLobby(): Observable<boolean> {
        if (!this.gameHandlerService.quizData) {
            return of(false);
        }

        return this.emitCreateLobby();
    }

    startGame() {
        this.webSocketService.emit('start-game', this.internalLobbyData.id);
    }

    cleanUp() {
        this.emitDeleteLobby().subscribe();
        this.webSocketService.disconnect();
        this.gameHandlerService.cleanUp();
        this.router.navigate(['/']);
    }

    private emitCreateLobby(): Observable<boolean> {
        return new Observable<boolean>((subscriber) => {
            this.webSocketService.emit('create-lobby', this.gameHandlerService.quizData, (lobbyData: unknown) => {
                if (lobbyData) {
                    this.internalLobbyData = lobbyData as LobbyData;
                    subscriber.next(true);
                    subscriber.complete();
                } else {
                    subscriber.next(false);
                    subscriber.complete();
                }
            });
        });
    }

    private emitDeleteLobby(): Observable<void> {
        return new Observable<void>((subscriber) => {
            this.webSocketService.emit('delete-lobby', this.internalLobbyData.id, () => {
                subscriber.next();
                subscriber.complete();
            });
        });
    }

    private onStartGame() {
        this.webSocketService.onEvent('start-game', () => {
            this.internalLobbyData.started = true;
        });
    }
}
