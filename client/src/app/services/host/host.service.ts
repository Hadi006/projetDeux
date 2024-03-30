import { Injectable } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { TimeService } from '@app/services/time/time.service';
import { TRANSITION_DELAY } from '@common/constant';
import { Game } from '@common/game';
import { HistogramData } from '@common/histogram-data';
import { Player } from '@common/player';
import { Answer, Question, Quiz } from '@common/quiz';
import { Observable, Subject } from 'rxjs';
import { HostSocketService } from '@app/services/host-socket/host-socket.service';

@Injectable({
    providedIn: 'root',
})
export class HostService {
    readonly internalQuestionEndedSubject = new Subject<void>();
    readonly internalGameEndedSubject = new Subject<void>();

    private timerId: number;

    private internalGame: Game | null;
    private internalNAnswered: number;
    private internalQuestionEnded: boolean;
    private currentQuestionIndex: number;
    private internalQuitters: Player[] = [];
    private internalHistograms: HistogramData[] = [];
    private gameStarted = false;

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
    get questionEndedSubject(): Subject<void> {
        return this.internalQuestionEndedSubject;
    }

    get gameEndedSubject(): Subject<void> {
        return this.internalGameEndedSubject;
    }

    get quitters(): Player[] {
        return this.internalQuitters;
    }

    get histograms(): HistogramData[] {
        return this.internalHistograms;
    }

    getTime(): number {
        return this.timeService.getTimeById(this.timerId);
    }

    getCurrentQuestion(): Question | undefined {
        return this.internalGame?.quiz.questions[this.currentQuestionIndex];
    }

    reset(): void {
        this.internalGame = null;
        this.internalNAnswered = 0;
        this.internalQuestionEnded = false;
        this.internalQuitters = [];
        this.internalHistograms = [];
        this.gameStarted = false;
    }

    isConnected(): boolean {
        return this.hostSocketService.isConnected();
    }

    handleSockets(): void {
        if (!this.hostSocketService.isConnected()) {
            this.hostSocketService.connect();
        }

        this.subscribeToPlayerJoined();
        this.subscribeToPlayerLeft();
        this.subscribeToConfirmPlayerAnswer();
        this.subscribeToPlayerUpdated();
    }

    createGame(quiz: Quiz): Observable<boolean> {
        return new Observable<boolean>((subscriber) => {
            this.hostSocketService.emitCreateGame(quiz).subscribe((game: unknown) => {
                if (game) {
                    this.internalGame = game as Game;
                    this.currentQuestionIndex = 0;
                    subscriber.next(true);
                } else {
                    subscriber.next(false);
                }
                subscriber.complete();
            });
        });
    }

    toggleLock(): void {
        if (!this.internalGame) {
            return;
        }

        this.internalGame.locked = !this.internalGame.locked;
        this.hostSocketService.emitToggleLock(this.internalGame.pin, this.internalGame.locked);
    }

    kick(playerName: string): void {
        if (!this.internalGame) {
            return;
        }

        this.hostSocketService.emitKick(this.internalGame.pin, playerName);
    }

    startGame(countdown: number): void {
        if (!this.internalGame) {
            return;
        }

        this.hostSocketService.emitStartGame(this.internalGame.pin, countdown);
        this.gameStarted = true;
        this.internalQuitters = [];

        this.timeService.stopTimerById(this.timerId);
        this.timeService.startTimerById(this.timerId, countdown, this.nextQuestion.bind(this));
    }

    nextQuestion(): void {
        const currentQuestion = this.getCurrentQuestion();
        if (!this.internalGame || !currentQuestion) {
            return;
        }

        this.internalQuestionEnded = false;

        const newHistogram: HistogramData = {
            labels: this.getCurrentQuestion()?.choices.map((choice) => `${choice.text} (${choice.isCorrect ? 'bonne' : 'mauvaise'} réponse)`) || [],
            datasets: [
                {
                    label: this.getCurrentQuestion()?.text || '',
                    data: this.getCurrentQuestion()?.choices.map(() => 0) || [],
                },
            ],
        };
        this.internalHistograms.push(newHistogram);

        this.hostSocketService.emitNextQuestion(this.internalGame.pin, {
            question: currentQuestion,
            countdown: this.internalGame.quiz.duration,
            histogram: newHistogram,
        });

        this.timeService.stopTimerById(this.timerId);
        this.timeService.startTimerById(this.timerId, TRANSITION_DELAY, this.setupNextQuestion.bind(this));
    }

    endGame(): void {
        if (!this.internalGame) {
            return;
        }

        this.hostSocketService.emitEndGame(this.internalGame.pin).subscribe((game: Game) => {
            this.router.navigate(['/endgame'], { state: { game } });
            this.cleanUp();
        });
    }

    cleanUp(): void {
        this.hostSocketService.disconnect();
        this.timeService.stopTimerById(this.timerId);
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
        if (!this.internalGame || !currentAnswer) {
            return;
        }

        this.hostSocketService.emitEndQuestion(this.internalGame.pin);
        this.hostSocketService.emitUpdateScores(this.internalGame.pin, this.currentQuestionIndex).subscribe((game: Game) => {
            this.internalGame = game;
            this.internalQuestionEndedSubject.next();
        });
        this.hostSocketService.emitAnswer(this.internalGame.pin, currentAnswer);
        this.internalQuestionEnded = true;
        this.currentQuestionIndex++;
    }

    private subscribeToPlayerJoined() {
        this.hostSocketService.onPlayerJoined().subscribe((player: Player) => {
            this.internalGame?.players.push(player);
        });
    }

    private subscribeToPlayerLeft(): void {
        this.hostSocketService.onPlayerLeft().subscribe((data) => {
            if (!this.internalGame || !this.gameStarted) {
                return;
            }

            const { players, player } = data;
            this.internalGame.players = players;

            this.internalQuitters.push(player);

            if (this.internalGame.players.length === 0) {
                this.internalGameEndedSubject.next();
            }
        });
    }

    private subscribeToConfirmPlayerAnswer(): void {
        this.hostSocketService.onConfirmPlayerAnswer().subscribe(() => {
            if (!this.internalGame) {
                return;
            }

            if (++this.internalNAnswered >= this.internalGame.players.length) {
                this.timeService.setTimeById(this.timerId, 0);
                this.internalNAnswered = 0;
            }
        });
    }

    private subscribeToPlayerUpdated(): void {
        this.hostSocketService.onPlayerUpdated().subscribe((histogramData: HistogramData) => {
            this.internalHistograms[this.internalHistograms.length - 1] = histogramData;
        });
    }

    private getCurrentAnswer(): Answer[] | undefined {
        return this.getCurrentQuestion()?.choices.filter((answer) => answer.isCorrect);
    }

    private setupNextQuestion(): void {
        if (!this.internalGame) {
            return;
        }

        if (!this.getCurrentQuestion()) {
            this.internalGameEndedSubject.next();
            return;
        }

        this.timeService.stopTimerById(this.timerId);
        this.timeService.startTimerById(this.timerId, this.internalGame.quiz.duration, this.endQuestion.bind(this));
    }
}
