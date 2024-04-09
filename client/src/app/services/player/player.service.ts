import { Injectable } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { PlayerSocketService } from '@app/services/player-socket/player-socket.service';
import { TimeService } from '@app/services/time/time.service';
import { INVALID_INDEX, TRANSITION_DELAY } from '@common/constant';
import { JoinGameEventData } from '@common/join-game-event-data';
import { JoinGameResult } from '@common/join-game-result';
import { Player } from '@common/player';
import { Answer, Question } from '@common/quiz';
import { Observable, Subject, Subscription } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class PlayerService {
    player: Player | null;
    readonly startGameSubject: Subject<void>;
    readonly endGameSubject: Subject<void>;

    private socketSubscription: Subscription;

    private timerId: number;

    private internalPin: string;
    private internalGameTitle: string;
    private internalGameId: string;
    private internalPlayers: string[];
    private internalGameStarted: boolean;
    private internalGameEnded: boolean;
    private internalAnswerConfirmed: boolean;
    private internalAnswer: Answer[];
    private internalIsCorrect: boolean;
    private internalQrlCorrect: number = INVALID_INDEX;

    constructor(
        private playerSocketService: PlayerSocketService,
        private timeService: TimeService,
        private router: Router,
    ) {
        this.router.events.subscribe((event) => {
            if (event instanceof NavigationEnd) {
                this.verifyUsesSockets();
            }
        });

        this.startGameSubject = new Subject<void>();
        this.endGameSubject = new Subject<void>();

        this.timerId = timeService.createTimerById();
        this.reset();
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

    get gameId(): string {
        return this.internalGameId;
    }

    get gameStarted(): boolean {
        return this.internalGameStarted;
    }

    get gameEnded(): boolean {
        return this.internalGameEnded;
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

    get qrlCorrect(): number {
        return this.internalQrlCorrect;
    }

    getPlayerAnswers(): Answer[] {
        if (!this.player) {
            return [];
        }

        return this.player.questions[this.player.questions.length - 1].choices;
    }

    isConnected(): boolean {
        return this.playerSocketService.isConnected();
    }

    handleSockets(): void {
        if (!this.playerSocketService.isConnected()) {
            this.playerSocketService.connect();
        }

        this.socketSubscription.unsubscribe();
        this.socketSubscription = new Subscription();

        this.socketSubscription.add(this.subscribeToPlayerJoined());
        this.socketSubscription.add(this.subscribeToPlayerLeft());
        this.socketSubscription.add(this.subscribeToOnKick());
        this.socketSubscription.add(this.subscribeToOnStartGame());
        this.socketSubscription.add(this.subscribeToOnEndQuestion());
        this.socketSubscription.add(this.subscribeToQuestionChanged());
        this.socketSubscription.add(this.subscribeToOnNewScore());
        this.socketSubscription.add(this.subscribeToOnAnswer());
        this.socketSubscription.add(this.subscribeToOnGameEnded());
        this.socketSubscription.add(this.subscribeToOnGameDeleted());
    }

    joinGame(pin: string, data: JoinGameEventData): Observable<string> {
        return new Observable<string>((observer) => {
            this.playerSocketService.emitJoinGame(pin, data).subscribe((result: JoinGameResult) => {
                if (!result.error) {
                    this.player = result.player;
                    this.internalPlayers = result.otherPlayers;
                    this.internalGameTitle = result.gameTitle;
                    this.internalGameId = result.gameId;
                    this.internalPin = pin;
                }

                observer.next(result.error);
                observer.complete();
            });
        });
    }

    updatePlayer(): void {
        if (!this.player) {
            return;
        }

        this.playerSocketService.emitUpdatePlayer(this.internalPin, this.player);
    }

    updateModificationDate(): void {
        if (!this.player) {
            return;
        }

        this.player.questions[this.player.questions.length - 1].lastModification = new Date();
    }

    handleKeyUp(event: KeyboardEvent): void {
        if (event.key === 'Enter') {
            this.confirmPlayerAnswer();
        }

        const key = parseInt(event.key, 10) - 1;
        if (key >= 0 && key < this.getPlayerAnswers().length) {
            this.getPlayerAnswers()[key].isCorrect = !this.getPlayerAnswers()[key].isCorrect;
            this.updatePlayer();
        }
    }

    confirmPlayerAnswer(): void {
        if (!this.player) {
            return;
        }

        this.player.hasConfirmedAnswer = true;
        this.playerSocketService.emitConfirmPlayerAnswer(this.internalPin, this.player);
        this.internalAnswerConfirmed = true;
    }

    getTime(): number {
        return this.timeService.getTimeById(this.timerId);
    }

    cleanUp(): void {
        this.playerSocketService.disconnect();
        this.socketSubscription.unsubscribe();
        this.timeService.stopTimerById(this.timerId);
        this.reset();
    }

    private reset() {
        this.socketSubscription = new Subscription();
        this.player = null;
        this.internalPin = '';
        this.internalGameTitle = '';
        this.internalGameId = '';
        this.internalPlayers = [];
        this.internalGameStarted = false;
        this.internalGameEnded = false;
        this.internalAnswerConfirmed = false;
        this.internalAnswer = [];
        this.internalIsCorrect = false;
        this.internalQrlCorrect = -1;
    }

    private verifyUsesSockets(): void {
        let currentRoute = this.router.routerState.snapshot.root;

        while (currentRoute.firstChild) {
            currentRoute = currentRoute.firstChild;
        }

        if (!currentRoute.data.usesSockets) {
            this.cleanUp();
        }
    }

    private subscribeToPlayerJoined(): Subscription {
        return this.playerSocketService.onPlayerJoined().subscribe((playerName) => {
            this.internalPlayers.push(playerName);
        });
    }

    private subscribeToPlayerLeft(): Subscription {
        return this.playerSocketService.onPlayerLeft().subscribe((players) => {
            this.internalPlayers = players.map((player) => player.name);
        });
    }

    private subscribeToOnKick(): Subscription {
        return this.playerSocketService.onKick().subscribe((playerName) => {
            if (!this.player) {
                return;
            }

            if (playerName === this.player.name) {
                this.router.navigate(['/']);
            }
        });
    }

    private subscribeToOnStartGame(): Subscription {
        return this.playerSocketService.onStartGame().subscribe((countdown) => {
            this.startGameSubject.next();
            this.internalGameStarted = true;
            this.timeService.startTimerById(this.timerId, countdown);
        });
    }

    private subscribeToOnEndQuestion(): Subscription {
        return this.playerSocketService.onEndQuestion().subscribe(() => {
            this.internalAnswerConfirmed = true;
            this.timeService.setTimeById(this.timerId, 0);
        });
    }

    private subscribeToQuestionChanged(): Subscription {
        return this.playerSocketService.onQuestionChanged().subscribe(({ question, countdown }) => {
            this.timeService.stopTimerById(this.timerId);
            this.timeService.startTimerById(this.timerId, TRANSITION_DELAY, this.setupNextQuestion.bind(this, question, countdown));
        });
    }

    private subscribeToOnNewScore(): Subscription {
        return this.playerSocketService.onNewScore().subscribe((player) => {
            if (!this.player) {
                return;
            }

            if (player.name === this.player.name) {
                if (player.score > this.player.score && player.questions[player.questions.length - 1].type === 'QCM') {
                    this.internalIsCorrect = true;
                } else if (player.questions[player.questions.length - 1].type === 'QRL' && player.score > this.player.score) {
                    this.internalQrlCorrect = (player.score - this.player.score) / player.questions[player.questions.length - 1].points;
                }
                this.player = player;
            }
        });
    }

    private subscribeToOnAnswer(): Subscription {
        return this.playerSocketService.onAnswer().subscribe((answer) => {
            this.internalAnswer = answer;
        });
    }

    private subscribeToOnGameEnded(): Subscription {
        return this.playerSocketService.onGameEnded().subscribe((game) => {
            this.router.navigate(['/endgame'], { state: { game } });
            this.cleanUp();
            this.internalGameEnded = true;
        });
    }

    private subscribeToOnGameDeleted(): Subscription {
        return this.playerSocketService.onGameDeleted().subscribe(() => {
            this.endGameSubject.next();
            this.router.navigate(['/']);
        });
    }

    private setupNextQuestion(question: Question | undefined, countdown: number): void {
        if (!this.player || !question) {
            return;
        }

        this.player.questions.push(question);
        this.player.hasInteracted = false;
        this.player.hasConfirmedAnswer = false;
        this.internalAnswerConfirmed = false;
        this.internalAnswer = [];
        this.internalIsCorrect = false;
        this.internalQrlCorrect = -1;
        this.timeService.stopTimerById(this.timerId);
        this.timeService.startTimerById(this.timerId, countdown);
    }
}
