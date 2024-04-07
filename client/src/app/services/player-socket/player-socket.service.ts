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
    private readonly playerJoinedSubject = new Subject<string>();
    private readonly playerLeftSubject = new Subject<Player[]>();
    private readonly kickSubject = new Subject<string>();
    private readonly startGameSubject = new Subject<number>();
    private readonly endQuestionSubject = new Subject<void>();
    private readonly questionChangedSubject = new Subject<QuestionChangedEventData>();
    private readonly newScoreSubject = new Subject<Player>();
    private readonly answerSubject = new Subject<Answer[]>();
    private readonly gameEndedSubject = new Subject<Game>();
    private readonly gameDeletedSubject = new Subject<void>();
    private readonly pauseTimerSubject = new Subject<void>();
    private readonly startPanicModeSubject = new Subject<void>();

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
        this.webSocketService.onEvent<Player>('player-joined', (player) => {
            this.playerJoinedSubject.next(player.name);
        });

        return this.playerJoinedSubject;
    }

    onPlayerLeft(): Subject<Player[]> {
        this.webSocketService.onEvent<PlayerLeftEventData>('player-left', (data) => {
            this.playerLeftSubject.next(data.players);
        });

        return this.playerLeftSubject;
    }

    onKick(): Subject<string> {
        this.webSocketService.onEvent<string>('kick', (playerName) => {
            this.kickSubject.next(playerName);
        });

        return this.kickSubject;
    }

    onStartGame(): Subject<number> {
        this.webSocketService.onEvent<number>('start-game', (countdown) => {
            this.startGameSubject.next(countdown);
        });

        return this.startGameSubject;
    }

    onEndQuestion(): Subject<void> {
        this.webSocketService.onEvent<void>('end-question', () => {
            this.endQuestionSubject.next();
        });

        return this.endQuestionSubject;
    }

    onQuestionChanged(): Subject<QuestionChangedEventData> {
        this.webSocketService.onEvent<QuestionChangedEventData>('question-changed', (data) => {
            this.questionChangedSubject.next(data);
        });

        return this.questionChangedSubject;
    }

    onNewScore(): Subject<Player> {
        this.webSocketService.onEvent<Player>('new-score', (player) => {
            this.newScoreSubject.next(player);
        });

        return this.newScoreSubject;
    }

    onAnswer(): Subject<Answer[]> {
        this.webSocketService.onEvent<Answer[]>('answer', (answer) => {
            this.answerSubject.next(answer);
        });

        return this.answerSubject;
    }

    onGameEnded(): Subject<Game> {
        this.webSocketService.onEvent<Game>('game-ended', (game) => {
            this.gameEndedSubject.next(game);
        });

        return this.gameEndedSubject;
    }

    onGameDeleted(): Subject<void> {
        this.webSocketService.onEvent<void>('game-deleted', () => {
            this.gameDeletedSubject.next();
        });

        return this.gameDeletedSubject;
    }
    onPauseTimerForPlayers(): Subject<void> {
        this.webSocketService.onEvent('timer-paused', () => {
            this.pauseTimerSubject.next();
        });
        return this.pauseTimerSubject;
    }
    onStartPanicMode(): Subject<void> {
        this.webSocketService.onEvent('in-panic', () => {
            this.startPanicModeSubject.next();
        });
        return this.startPanicModeSubject;
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
