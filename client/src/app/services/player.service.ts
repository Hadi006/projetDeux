import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { TRANSITION_DELAY } from '@common/constant';
import { Player } from '@common/player';
import { Answer, Question } from '@common/quiz';
import { RoomData } from '@common/room-data';
import { Observable, Subject } from 'rxjs';
import { TimeService } from './time.service';
import { WebSocketService } from './web-socket.service';

@Injectable({
    providedIn: 'root',
})
export class PlayerService {
    player: Player;

    private internalPin: string;
    private internalGameTitle: string;
    private internalPlayers: string[] = [];

    private timerId: number;
    private internalAnswerConfirmed: boolean = false;
    private internalAnswer: Answer[];
    private internalIsCorrect: boolean = false;
    private internalStartGameSubject: Subject<void> = new Subject<void>();
    private internalEndGameSubject: Subject<void> = new Subject<void>();

    constructor(
        private webSocketService: WebSocketService,
        private timeService: TimeService,
        private router: Router,
    ) {
        this.timerId = timeService.createTimerById(); // soit qu'on initialise tous les attributs dans le constructeur, soit qu'on les initialise tout en dehors du constructeur
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

    get startGameSubject(): Subject<void> {
        return this.internalStartGameSubject;
    }

    get endGameSubject(): Subject<void> {
        return this.internalEndGameSubject;
    }

    getPlayerAnswers(): Answer[] {
        return this.player.questions[this.player.questions.length - 1].choices;
    }

    getPlayerBooleanAnswers(): boolean[] {
        return this.getPlayerAnswers().map((answer) => answer.isCorrect);
    }

    handleSockets() {
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
        this.onGameDeleted();
    }

    joinGame(pin: string, playerName: string): Observable<string> {
        return new Observable<string>((observer) => {
            this.webSocketService.emit<RoomData<string>>('join-game', { pin, data: playerName }, (response: unknown) => {
                const responseData = response as { player: Player; players: string[]; gameTitle: string; error: string };
                if (!responseData.error) {
                    this.player = responseData.player;
                    this.internalPlayers = responseData.players;
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

    private resetPlayerAnswers(question: Question): void {
        const resetQuestion = { ...question };
        resetQuestion.choices = question.choices.map((choice) => ({ ...choice, isCorrect: false })); // le joueur ne devrait pas recevoir la question avec les bonnes réponses, le serveur devrait envoyer une question avec des réponses vides
        this.player.questions.push(resetQuestion);
        this.internalAnswerConfirmed = false;
        this.internalAnswer = [];
        this.internalIsCorrect = false;
        this.updatePlayer(); // c'est mieux de faire le update (mettre une question vide) dans le cote serveur pour éviter la concurrence
    }

    private emitLeaveGame() {
        this.webSocketService.emit<RoomData<string>>('player-leave', { pin: this.internalPin, data: this.player.name });
    }

    private emitUpdatePlayer() {
        this.webSocketService.emit<RoomData<Player>>('update-player', { pin: this.internalPin, data: this.player });
    }

    private emitConfirmPlayerAnswer() {
        this.webSocketService.emit<RoomData<Player>>('confirm-player-answer', { pin: this.internalPin, data: this.player });
    }

    private onPlayerJoined() {
        this.webSocketService.onEvent<Player>('player-joined', (player) => {
            this.internalPlayers.push(player.name);
        });
    }

    private onPlayerLeft() {
        this.webSocketService.onEvent<{ players: Player[]; player: Player }>('player-left', (data) => {
            const { players } = data;
            this.internalPlayers = players.map((player) => player.name);
        });
    }

    private onKick() {
        this.webSocketService.onEvent<string>('kicked', (playerName) => {
            if (playerName === this.player.name) {
                this.router.navigate(['/']);
            }
        });
    }

    private onStartGame() {
        this.webSocketService.onEvent<number>('start-game', (countdown) => {
            this.internalStartGameSubject.next();
            this.timeService.startTimerById(this.timerId, countdown);
        });
    }

    private onEndQuestion() {
        this.webSocketService.onEvent<void>('end-question', () => {
            this.internalAnswerConfirmed = true;
            this.timeService.setTimeById(this.timerId, 0);
        });
    }

    private onNextQuestion() {
        this.webSocketService.onEvent<{ question: Question; countdown: number }>('next-question', ({ question, countdown }) => {
            this.timeService.stopTimerById(this.timerId);
            this.timeService.startTimerById(this.timerId, TRANSITION_DELAY, this.setupNextQuestion.bind(this, question, countdown));
        });
    }

    private onNewScore() {
        this.webSocketService.onEvent<Player>('new-score', (player) => {
            if (player.name === this.player.name) {
                if (player.score > this.player.score) {
                    this.internalIsCorrect = true;
                }
                this.player = player;
            }
        });
    }

    private onAnswer() {
        this.webSocketService.onEvent<Answer[]>('answer', (answer) => {
            this.internalAnswer = answer;
        });
    }

    private onGameDeleted() {
        this.webSocketService.onEvent<void>('game-deleted', () => {
            this.internalEndGameSubject.next();
            this.leaveGame();
        });
    }

    private setupNextQuestion(question: Question, countdown: number): void {
        this.resetPlayerAnswers(question);
        this.timeService.stopTimerById(this.timerId);
        this.timeService.startTimerById(this.timerId, countdown);
    }
}
