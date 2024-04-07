import { Injectable } from '@angular/core';
import { WebSocketService } from '@app/services/web-socket/web-socket.service';
import { Game } from '@common/game';
import { HistogramData } from '@common/histogram-data';
import { NextQuestionEventData } from '@common/next-question-event-data';
import { Player } from '@common/player';
import { PlayerLeftEventData } from '@common/player-left-event-data';
import { Answer, Quiz } from '@common/quiz';
import { RoomData } from '@common/room-data';
import { Observable, Subject } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class HostSocketService {
    private readonly playerLeftSubject = new Subject<PlayerLeftEventData>();
    private readonly playerJoinedSubject = new Subject<Player>();
    private readonly confirmPlayerAnswerSubject = new Subject<void>();
    private readonly playerUpdatedSubject = new Subject<{ player: Player; histogramData: HistogramData }>();

    constructor(private webSocketService: WebSocketService) {}

    connect(): void {
        this.webSocketService.connect();
    }

    disconnect(): void {
        this.webSocketService.disconnect();
    }

    isConnected(): boolean {
        return this.webSocketService.isSocketAlive();
    }

    onPlayerJoined(): Subject<Player> {
        this.webSocketService.onEvent<Player>('player-joined', (player) => {
            this.playerJoinedSubject.next(player);
        });

        return this.playerJoinedSubject;
    }

    onPlayerLeft(): Subject<PlayerLeftEventData> {
        this.webSocketService.onEvent<PlayerLeftEventData>('player-left', (data) => {
            this.playerLeftSubject.next(data);
        });

        return this.playerLeftSubject;
    }

    onConfirmPlayerAnswer(): Subject<void> {
        this.webSocketService.onEvent<void>('confirm-player-answer', () => {
            this.confirmPlayerAnswerSubject.next();
        });

        return this.confirmPlayerAnswerSubject;
    }

    onPlayerUpdated(): Subject<{ player: Player; histogramData: HistogramData }> {
        this.webSocketService.onEvent<{ player: Player; histogramData: HistogramData }>('player-updated', (data) => {
            this.playerUpdatedSubject.next(data);
        });

        return this.playerUpdatedSubject;
    }

    emitCreateGame(quiz: Quiz): Observable<Game | undefined> {
        return new Observable<Game | undefined>((subscriber) => {
            this.webSocketService.emit<Quiz>('create-game', quiz, (game: unknown) => {
                if (game) {
                    subscriber.next(game as Game);
                } else {
                    subscriber.next(undefined);
                }
            });
        });
    }

    emitToggleLock(pin: string, locked: boolean): void {
        this.webSocketService.emit<RoomData<boolean>>('toggle-lock', { pin, data: locked });
    }

    emitKick(pin: string, playerName: string): void {
        this.webSocketService.emit<RoomData<string>>('kick', { pin, data: playerName });
    }

    emitMute(pin: string, player: Player): void {
        this.webSocketService.emit<RoomData<Player>>('mute', { pin, data: player });
    }

    emitStartGame(pin: string, countdown: number): void {
        this.webSocketService.emit<RoomData<number>>('start-game', { pin, data: countdown });
    }

    emitNextQuestion(pin: string, data: NextQuestionEventData) {
        this.webSocketService.emit<RoomData<NextQuestionEventData>>('next-question', { pin, data });
    }

    emitEndGame(pin: string): Observable<Game> {
        return new Observable<Game>((subscriber) => {
            this.webSocketService.emit<string>('end-game', pin, (game: unknown) => {
                subscriber.next(game as Game);
            });
        });
    }

    emitEndQuestion(pin: string): void {
        this.webSocketService.emit<string>('end-question', pin);
    }

    emitUpdateScores(pin: string, currentQuestionIndex: number): Observable<Game> {
        return new Observable<Game>((subscriber) => {
            this.webSocketService.emit<RoomData<number>>('update-scores', { pin, data: currentQuestionIndex }, (game: unknown) => {
                subscriber.next(game as Game);
            });
        });
    }

    emitAnswer(pin: string, currentAnswer: Answer[]): void {
        this.webSocketService.emit<RoomData<Answer[]>>('answer', { pin, data: currentAnswer });
    }
}
