import { Injectable } from '@angular/core';
import { WebSocketService } from '@app/services/web-socket/web-socket.service';
import { Game } from '@common/game';
import { JoinGameResult } from '@common/join-game-result';
import { Player } from '@common/player';
import { PlayerLeftEventData } from '@common/player-left-event-data';
import { QuestionChangedEventData } from '@common/question-changed-event-data';
import { Answer } from '@common/quiz';
import { RoomData } from '@common/room-data';
import { Observable, Subject } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class PlayerSocketService {
    constructor(private webSocketService: WebSocketService) {}

    isConnected(): boolean {
        return this.webSocketService.isSocketAlive();
    }

    connect(): void {
        this.webSocketService.connect();
    }

    disconnect(): void {
        this.webSocketService.disconnect();
    }

    onPlayerJoined(): Subject<string> {
        const playerJoinedSubject = new Subject<string>();

        this.webSocketService.onEvent<Player>('player-joined', (player) => {
            playerJoinedSubject.next(player.name);
        });

        return playerJoinedSubject;
    }

    onPlayerLeft(): Subject<Player[]> {
        const playerLeftSubject = new Subject<Player[]>();

        this.webSocketService.onEvent<PlayerLeftEventData>('player-left', (data) => {
            playerLeftSubject.next(data.players);
        });

        return playerLeftSubject;
    }

    onKick(): Subject<string> {
        const kickSubject = new Subject<string>();

        this.webSocketService.onEvent<string>('kick', (playerName) => {
            kickSubject.next(playerName);
        });

        return kickSubject;
    }

    onStartGame(): Subject<number> {
        const startGameSubject = new Subject<number>();

        this.webSocketService.onEvent<number>('start-game', (countdown) => {
            startGameSubject.next(countdown);
        });

        return startGameSubject;
    }

    onEndQuestion(): Subject<void> {
        const endQuestionSubject = new Subject<void>();

        this.webSocketService.onEvent<void>('end-question', () => {
            endQuestionSubject.next();
        });

        return endQuestionSubject;
    }

    onQuestionChanged(): Subject<QuestionChangedEventData> {
        const questionChangedSubject = new Subject<QuestionChangedEventData>();

        this.webSocketService.onEvent<QuestionChangedEventData>('question-changed', (data) => {
            questionChangedSubject.next(data);
        });

        return questionChangedSubject;
    }

    onNewScore(): Subject<Player> {
        const newScoreSubject = new Subject<Player>();

        this.webSocketService.onEvent<Player>('new-score', (player) => {
            newScoreSubject.next(player);
        });

        return newScoreSubject;
    }

    onAnswer(): Subject<Answer[]> {
        const answerSubject = new Subject<Answer[]>();

        this.webSocketService.onEvent<Answer[]>('answer', (answer) => {
            answerSubject.next(answer);
        });

        return answerSubject;
    }

    onGameEnded(): Subject<Game> {
        const gameEndedSubject = new Subject<Game>();

        this.webSocketService.onEvent<Game>('game-ended', (game) => {
            gameEndedSubject.next(game);
        });

        return gameEndedSubject;
    }

    onGameDeleted(): Subject<void> {
        const gameDeletedSubject = new Subject<void>();

        this.webSocketService.onEvent<void>('game-deleted', () => {
            gameDeletedSubject.next();
        });

        return gameDeletedSubject;
    }

    emitJoinGame(pin: string, playerName: string): Observable<JoinGameResult> {
        return new Observable<JoinGameResult>((observer) => {
            this.webSocketService.emit<RoomData<string>>('join-game', { pin, data: playerName }, (response: unknown) => {
                observer.next(response as JoinGameResult);
                observer.complete();
            });
        });
    }

    emitUpdatePlayer(pin: string, player: Player): void {
        this.webSocketService.emit<RoomData<Player>>('update-player', { pin, data: player });
    }

    emitConfirmPlayerAnswer(pin: string, player: Player): void {
        this.webSocketService.emit<RoomData<Player>>('confirm-player-answer', { pin, data: player });
    }
}
