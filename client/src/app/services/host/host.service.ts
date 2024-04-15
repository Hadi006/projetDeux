import { Injectable } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { HostSocketService } from '@app/services/host-socket/host-socket.service';
import { TimeService } from '@app/services/time/time.service';
import { INVALID_INDEX, PANIC_MODE_TIMER, QCM_TIME_FOR_PANIC, QRL_TIME_FOR_PANIC, TRANSITION_DELAY } from '@common/constant';
import { Game } from '@common/game';
import { HistogramData } from '@common/histogram-data';
import { Player } from '@common/player';
import { Answer, Question, Quiz } from '@common/quiz';
import { Observable, Subject, Subscription } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class HostService {
    readonly questionEndedSubject: Subject<void>;
    readonly gameEndedSubject: Subject<void>;

    currentQuestionIndex: number;

    private socketSubscription: Subscription;

    private timerId: number;
    private internalGame: Game | null;
    private internalNAnswered: number;
    private internalQuestionEnded: boolean;
    private internalQuitters: Player[] = [];
    private internalHistograms: HistogramData[] = [];
    private isPanicMode = false;

    constructor(
        private hostSocketService: HostSocketService,
        private timeService: TimeService,
        private router: Router,
    ) {
        this.router.events.subscribe((event) => {
            if (event instanceof NavigationEnd) {
                this.verifyUsesSockets();
            }
        });
        this.questionEndedSubject = new Subject<void>();
        this.gameEndedSubject = new Subject<void>();
        this.timerId = timeService.createTimerById();
        this.reset();
    }
    get game(): Game | null {
        return this.internalGame;
    }
    get nAnswered(): number {
        return this.internalNAnswered;
    }
    get questionEnded(): boolean {
        return this.internalQuestionEnded;
    }
    get quitters(): Player[] {
        return this.internalQuitters;
    }
    get histograms(): HistogramData[] {
        return this.internalHistograms;
    }
    get isPanic(): boolean {
        return this.isPanicMode;
    }
    togglePanic(): void {
        if (!this.isPanicMode) this.isPanicMode = true;
    }
    getTime(): number {
        return this.timeService.getTimeById(this.timerId);
    }
    pauseTimer(): void {
        this.pauseTimerForEveryone();
        return this.timeService.toggleTimerById(this.timerId);
    }
    stopPanicMode(): void {
        this.isPanicMode = false;
        return this.timeService.stopPanicMode();
    }
    getCurrentQuestion(): Question | undefined {
        return this.internalGame?.quiz.questions[this.currentQuestionIndex];
    }
    isConnected(): boolean {
        return this.hostSocketService.isConnected();
    }
    handleSockets(): void {
        if (!this.hostSocketService.isConnected()) this.hostSocketService.connect();
        this.socketSubscription.unsubscribe();
        this.socketSubscription = new Subscription();
        this.socketSubscription.add(this.subscribeToPlayerJoined());
        this.socketSubscription.add(this.subscribeToPlayerLeft());
        this.socketSubscription.add(this.subscribeToConfirmPlayerAnswer());
        this.socketSubscription.add(this.subscribeToPlayerUpdated());
        this.socketSubscription.add(this.subscribeToNewHost());
    }
    createGame(quiz: Quiz): Observable<boolean> {
        return new Observable<boolean>((subscriber) => {
            this.hostSocketService.emitCreateGame(quiz).subscribe((game: Game | undefined) => {
                if (game) {
                    this.internalGame = game;
                    subscriber.next(true);
                } else {
                    subscriber.next(false);
                }
                subscriber.complete();
            });
        });
    }
    requestGame(pin: string): Observable<void> {
        return new Observable<void>((subscriber) => {
            this.hostSocketService.emitRequestGame(pin).subscribe((game: Game) => {
                this.internalGame = game;
                subscriber.next();
            });
        });
    }
    toggleLock(): void {
        if (!this.internalGame) return;
        this.internalGame.locked = !this.internalGame.locked;
        this.hostSocketService.emitToggleLock(this.internalGame.pin, this.internalGame.locked);
    }
    kick(playerName: string): void {
        if (!this.internalGame) {
            return;
        }

        this.hostSocketService.emitKick(this.internalGame.pin, playerName);
    }
    mute(playerName: string): void {
        if (!this.internalGame) {
            return;
        }
        const player = this.internalGame.players.find((p) => p.name === playerName);
        if (!player) {
            return;
        }

        player.muted = !player.muted;

        this.hostSocketService.emitMute(this.internalGame.pin, player);
    }
    startGame(countdown: number): void {
        if (!this.internalGame) {
            return;
        }

        this.hostSocketService.emitStartGame(this.internalGame.pin, countdown);
        this.internalQuitters = [];
        this.timeService.stopTimerById(this.timerId);
        this.timeService.startTimerById(this.timerId, countdown, this.nextQuestion.bind(this));
    }
    nextQuestion(): void {
        this.timeService.stopTimerById(this.timerId);
        this.timerId = this.timeService.createTimerById();
        this.timeService.startTimerById(this.timerId, TRANSITION_DELAY, this.setupNextQuestion.bind(this));

        const currentQuestion = this.getCurrentQuestion();
        if (!this.internalGame || !currentQuestion) {
            return;
        }

        this.internalQuestionEnded = false;

        let newHistogram: HistogramData;
        if (currentQuestion.type === 'QCM') {
            newHistogram = {
                labels: currentQuestion.choices.map((choice) => `${choice.text} (${choice.isCorrect ? 'bonne' : 'mauvaise'} réponse)`),
                datasets: [
                    {
                        label: currentQuestion.text,
                        data: currentQuestion.choices.map(() => 0),
                    },
                ],
            };
        } else {
            newHistogram = {
                labels: ['Joueurs actifs', 'Joueurs inactifs'],
                datasets: [
                    {
                        label: currentQuestion.text,
                        data: [0, this.internalGame.players.length],
                    },
                ],
            };
        }
        this.internalHistograms.push(newHistogram);
        this.hostSocketService.emitNextQuestion(this.internalGame.pin, {
            question: currentQuestion,
            countdown: this.internalGame.quiz.duration,
            histogram: newHistogram,
        });
    }
    updatePlayers(): void {
        if (!this.internalGame) {
            return;
        }
        this.hostSocketService.emitUpdatePlayers(this.internalGame.pin, this.internalGame.players);
    }
    endGame(): void {
        if (!this.internalGame) {
            return;
        }

        this.hostSocketService.emitEndGame(this.internalGame.pin).subscribe((game: Game) => {
            this.router.navigate(['/endgame'], { state: { game } });
        });
    }
    cleanUp(): void {
        this.hostSocketService.disconnect();
        this.socketSubscription.unsubscribe();
        this.timeService.stopTimerById(this.timerId);
        this.reset();
    }
    canActivatePanicMode(): boolean {
        return (
            ((this.getCurrentQuestion()?.type === 'QCM' && this.getTime() >= QCM_TIME_FOR_PANIC) ||
                (this.getCurrentQuestion()?.type === 'QRL' && this.getTime() >= QRL_TIME_FOR_PANIC)) &&
            !this.isPanicMode
        );
    }
    startPanicMode() {
        if (this.canActivatePanicMode()) {
            this.isPanicMode = true;
            const startTimerValue: number = this.getTime();
            this.timeService.stopTimerById(this.timerId);
            this.timeService.startPanicMode();
            this.startPanicModeForEveryone();
            this.timerId = this.timeService.createTimerById(PANIC_MODE_TIMER);
            this.timeService.startTimerById(this.timerId, startTimerValue, this.endQuestion.bind(this));
        }
    }

    private reset(): void {
        this.socketSubscription = new Subscription();
        this.internalGame = null;
        this.internalNAnswered = 0;
        this.internalQuestionEnded = false;
        this.currentQuestionIndex = 0;
        this.internalQuitters = [];
        this.internalHistograms = [];
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
    private endQuestion(): void {
        const currentAnswer = this.getCurrentAnswer();
        if (!this.internalGame || !currentAnswer) return;
        this.hostSocketService.emitEndQuestion(this.internalGame.pin);
        const isTestMode = this.internalGame?.players.length === 1 && this.internalGame.players[0].name === 'Organisateur';
        if (this.getCurrentQuestion()?.type === 'QRL' && !isTestMode) {
            this.internalQuestionEnded = true;
            this.currentQuestionIndex++;
            this.questionEndedSubject.next();
            return;
        }
        this.hostSocketService.emitUpdateScores(this.internalGame.pin, this.currentQuestionIndex).subscribe((game: Game) => {
            this.internalGame = game;
            this.questionEndedSubject.next();
        });
        this.hostSocketService.emitAnswer(this.internalGame.pin, currentAnswer);
        if (this.isPanicMode) {
            this.stopPanicMode();
        }
        this.timeService.stopTimerById(this.timerId);
        this.internalQuestionEnded = true;
        this.currentQuestionIndex++;
    }
    private subscribeToPlayerJoined(): Subscription {
        return this.hostSocketService.onPlayerJoined().subscribe((player: Player) => {
            this.internalGame?.players.push(player);
        });
    }
    private subscribeToPlayerLeft(): Subscription {
        return this.hostSocketService.onPlayerLeft().subscribe((data) => {
            if (!this.internalGame) return;
            const { players, player } = data;
            this.internalGame.players = players;
            this.internalQuitters.push(player);
            player.hasLeft = true;

            if (this.internalGame.players.length === 0) {
                this.gameEndedSubject.next();
            }
        });
    }

    private subscribeToConfirmPlayerAnswer(): Subscription {
        return this.hostSocketService.onConfirmPlayerAnswer().subscribe(() => {
            if (!this.internalGame) return;
            if (++this.internalNAnswered >= this.internalGame.players.length) {
                this.timeService.setTimeById(this.timerId, 0);
                this.internalNAnswered = 0;
            }
        });
    }
    private subscribeToPlayerUpdated(): Subscription {
        return this.hostSocketService.onPlayerUpdated().subscribe(({ player, histogramData }) => {
            this.internalHistograms[this.internalHistograms.length - 1] = histogramData;
            const playerIndex = this.internalGame?.players.findIndex((p) => p.name === player.name);
            if (playerIndex === undefined || playerIndex === INVALID_INDEX || !this.internalGame) {
                return;
            }

            this.internalGame.players[playerIndex] = player;
        });
    }

    private subscribeToNewHost(): Subscription {
        return this.hostSocketService.onNewHost().subscribe((game: Game) => {
            this.internalGame = game;
        });
    }

    private getCurrentAnswer(): Answer[] | undefined {
        return this.getCurrentQuestion()?.choices.filter((answer) => answer.isCorrect);
    }

    private setupNextQuestion(): void {
        if (!this.internalGame) return;
        if (!this.getCurrentQuestion()) {
            this.gameEndedSubject.next();
            return;
        }

        this.internalGame.players.forEach((player) => {
            player.hasInteracted = false;
            player.hasConfirmedAnswer = false;
        });

        this.timeService.stopTimerById(this.timerId);
        this.timeService.startTimerById(this.timerId, this.internalGame.quiz.duration, this.endQuestion.bind(this));
    }

    private pauseTimerForEveryone(): void {
        if (!this.internalGame) return;
        this.hostSocketService.emitPauseTimer(this.internalGame.pin);
    }

    private startPanicModeForEveryone(): void {
        if (!this.internalGame) return;
        this.hostSocketService.emitPanicMode(this.internalGame.pin);
    }
}
