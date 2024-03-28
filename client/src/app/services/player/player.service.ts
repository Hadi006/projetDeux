import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { TRANSITION_DELAY } from '@common/constant';
import { Game } from '@common/game';
import { JoinGameResult } from '@common/join-game-result';
import { Player } from '@common/player';
import { QuestionChangedEventData } from '@common/question-changed-event-data';
import { Answer, Question } from '@common/quiz';
import { RoomData } from '@common/room-data';
import { Observable, Subject } from 'rxjs';
import { TimeService } from '@app/services/time/time.service';
import { WebSocketService } from '@app/services/web-socket/web-socket.service';
import { JoinGameEventData } from '@common/join-game-event-data';

@Injectable({
    providedIn: 'root',
})
export class PlayerService {
    player: Player;
    readonly startGameSubject: Subject<void>;
    readonly endGameSubject: Subject<void>;

    private internalPin: string;
    private internalGameTitle: string;
    private internalPlayers: string[];

    private timerId: number;
    private internalAnswerConfirmed: boolean;
    private internalAnswer: Answer[];
    private internalIsCorrect: boolean;

    constructor(
        private webSocketService: WebSocketService,
        private timeService: TimeService,
        private router: Router,
    ) {
        this.timerId = timeService.createTimerById();
        this.startGameSubject = new Subject<void>();
        this.endGameSubject = new Subject<void>();
        this.internalPlayers = [];
        this.internalAnswerConfirmed = false;
        this.internalIsCorrect = false;
    }

    get pin(): string {
        return this.internalPin;
    }

    get players(): string[] {
        return this.internalPlayers;
    }

    get gameTitle(): string {
        return this.internalGameTitle;
    }

    get answerConfirmed(): boolean {
        return this.internalAnswerConfirmed;
    }

    get answer(): Answer[] {
        return this.internalAnswer;
    }

    get isCorrect(): boolean {
        return this.internalIsCorrect;
    }

    getPlayerAnswers(): Answer[] {
        return this.player.questions[this.player.questions.length - 1].choices;
    }

    getPlayerBooleanAnswers(): boolean[] {
        return this.getPlayerAnswers().map((answer) => answer.isCorrect);
    }

    handleSockets(): void {
        if (!this.webSocketService.isSocketAlive()) {
            this.webSocketService.connect();
        }

        this.onPlayerJoined();
        this.onPlayerLeft();
        this.onKick();
        this.onStartGame();
        this.onEndQuestion();
        this.onNextQuestion();
        this.onNewScore();
        this.onAnswer();
        this.onGameEnded();
        this.onGameDeleted();
    }

    joinGame(pin: string, playerName: JoinGameEventData): Observable<string> {
        return new Observable<string>((observer) => {
            this.webSocketService.emit<RoomData<JoinGameEventData>>('join-game', { pin, data: playerName }, (response: unknown) => {
                const responseData = response as JoinGameResult;
                if (!responseData.error) {
                    this.player = responseData.player;
                    this.internalPlayers = responseData.otherPlayers;
                    this.internalGameTitle = responseData.gameTitle;
                    this.internalPin = pin;
                }

                observer.next(responseData.error);
                observer.complete();
            });
        });
    }

    leaveGame(): void {
        this.emitLeaveGame();
        // this.chatService.clearChatbox(); Erreur lorsquon join game
        this.cleanUp();
        this.router.navigate(['/']);
    }

    updatePlayer(): void {
        this.emitUpdatePlayer();
    }

    handleKeyUp(event: KeyboardEvent): void {
        if (event.key === 'Enter') {
            this.confirmPlayerAnswer();
        }

        const key = parseInt(event.key, 10) - 1;
        if (key >= 0 && key < this.getPlayerAnswers().length) {
            this.getPlayerAnswers()[key].isCorrect = !this.getPlayerAnswers()[key].isCorrect;
        }
    }

    confirmPlayerAnswer(): void {
        this.emitConfirmPlayerAnswer();
        this.internalAnswerConfirmed = true;
    }

    getTime(): number {
        return this.timeService.getTimeById(this.timerId);
    }

    cleanUp(): void {
        this.webSocketService.disconnect();
        this.timeService.stopTimerById(this.timerId);
    }

    private emitLeaveGame(): void {
        this.webSocketService.emit<RoomData<string>>('player-leave', { pin: this.internalPin, data: this.player.name });
    }

    private emitUpdatePlayer(): void {
        this.webSocketService.emit<RoomData<Player>>('update-player', { pin: this.internalPin, data: this.player });
    }

    private emitConfirmPlayerAnswer(): void {
        this.webSocketService.emit<RoomData<Player>>('confirm-player-answer', { pin: this.internalPin, data: this.player });
    }

    private onPlayerJoined(): void {
        this.webSocketService.onEvent<Player>('player-joined', (player) => {
            this.internalPlayers.push(player.name);
        });
    }

    private onPlayerLeft(): void {
        this.webSocketService.onEvent<{ players: Player[]; player: Player }>('player-left', (data) => {
            const { players } = data;
            this.internalPlayers = players.map((player) => player.name);
        });
    }

    private onKick(): void {
        this.webSocketService.onEvent<string>('kicked', (playerName) => {
            if (playerName === this.player.name) {
                this.router.navigate(['/']);
            }
        });
    }

    private onStartGame(): void {
        this.webSocketService.onEvent<number>('start-game', (countdown) => {
            this.startGameSubject.next();
            this.timeService.startTimerById(this.timerId, countdown);
        });
    }

    private onEndQuestion(): void {
        this.webSocketService.onEvent<void>('end-question', () => {
            this.internalAnswerConfirmed = true;
            this.timeService.setTimeById(this.timerId, 0);
        });
    }

    private onNextQuestion(): void {
        this.webSocketService.onEvent<QuestionChangedEventData>('question-changed', ({ question, countdown }) => {
            this.timeService.stopTimerById(this.timerId);
            this.timeService.startTimerById(this.timerId, TRANSITION_DELAY, this.setupNextQuestion.bind(this, question, countdown));
        });
    }

    private onNewScore(): void {
        this.webSocketService.onEvent<Player>('new-score', (player) => {
            if (player.name === this.player.name) {
                if (player.score > this.player.score) {
                    this.internalIsCorrect = true;
                }
                this.player = player;
            }
        });
    }

    private onAnswer(): void {
        this.webSocketService.onEvent<Answer[]>('answer', (answer) => {
            this.internalAnswer = answer;
        });
    }

    private onGameEnded(): void {
        this.webSocketService.onEvent<Game>('game-ended', (game) => {
            this.router.navigate(['/endgame'], { queryParams: { game: JSON.stringify(game) } });
            this.cleanUp();
        });
    }

    private onGameDeleted(): void {
        this.webSocketService.onEvent<Game>('game-deleted', () => {
            this.leaveGame();
            this.endGameSubject.next();
        });
    }

    private setupNextQuestion(question: Question, countdown: number): void {
        this.player.questions.push(question);
        this.internalAnswerConfirmed = false;
        this.internalAnswer = [];
        this.internalIsCorrect = false;
        this.timeService.stopTimerById(this.timerId);
        this.timeService.startTimerById(this.timerId, countdown);
    }
}
