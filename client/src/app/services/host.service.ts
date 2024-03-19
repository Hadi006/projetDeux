import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { TRANSITION_DELAY } from '@common/constant';
import { Game } from '@common/game';
import { HistogramData } from '@common/histogram-data';
import { Player } from '@common/player';
import { Answer, Question, Quiz } from '@common/quiz';
import { RoomData } from '@common/room-data';
import { Observable, Subject } from 'rxjs';
import { TimeService } from './time.service';
import { WebSocketService } from './web-socket.service';
import { NextQuestionEventData } from '@common/next-question-event-data';
import { PlayerLeftEventData } from '@common/player-left-event-data';

@Injectable({
    providedIn: 'root',
})
export class HostService {
    private internalGame: Game;
    private internalNAnswered = 0;
    private internalQuestionEnded: boolean;
    private timerId: number;
    private internalQuestionEndedSubject = new Subject<void>();
    private internalGameEndedSubject = new Subject<void>();
    private currentQuestionIndex: number;
    private internalQuitters: Player[] = [];
    private internalHistograms: HistogramData[] = [];
    private gameStarted = false;

    constructor(
        private webSocketService: WebSocketService,
        private timeService: TimeService,
        private router: Router,
    ) {
        this.timerId = timeService.createTimerById();
    }

    get game(): Game {
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
        return this.internalGame.quiz.questions[this.currentQuestionIndex];
    }

    handleSockets(): void {
        if (!this.webSocketService.isSocketAlive()) {
            this.webSocketService.connect();
        }

        this.onPlayerJoined();
        this.onPlayerLeft();
        this.onConfirmPlayerAnswer();
        this.onPlayerUpdated();
    }

    createGame(quiz: Quiz): Observable<boolean> {
        return this.emitCreateGame(quiz);
    }

    leaveGame(): void {
        this.cleanUp();
        this.router.navigate(['/']);
    }

    toggleLock(): void {
        this.internalGame.locked = !this.internalGame.locked;
        this.emitToggleLock();
    }

    kick(playerName: string): void {
        this.emitKick(playerName);
    }

    startGame(countdown: number): void {
        this.emitStartGame(countdown);
        this.gameStarted = true;
        this.internalQuitters = [];

        this.timeService.stopTimerById(this.timerId);
        this.timeService.startTimerById(this.timerId, countdown, this.nextQuestion.bind(this));
    }

    nextQuestion(): void {
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
        this.emitNextQuestion();
        this.timeService.stopTimerById(this.timerId);
        this.timeService.startTimerById(this.timerId, TRANSITION_DELAY, this.setupNextQuestion.bind(this));
    }

    endGame(): void {
        this.emitEndGame();
    }

    cleanUp(): void {
        this.emitDeleteGame();
        this.internalHistograms = [];
        this.webSocketService.disconnect();
        this.timeService.stopTimerById(this.timerId);
    }

    private endQuestion(): void {
        this.emitEndQuestion();
        this.emitUpdateScores();
        this.emitAnswer();
        this.internalQuestionEnded = true;
        this.currentQuestionIndex++;
        this.internalQuestionEndedSubject.next();
    }

    private emitToggleLock(): void {
        this.webSocketService.emit<RoomData<boolean>>('toggle-lock', {
            pin: this.internalGame.pin,
            data: this.internalGame.locked,
        });
    }

    private emitCreateGame(quiz: Quiz): Observable<boolean> {
        return new Observable<boolean>((subscriber) => {
            this.webSocketService.emit<Quiz>('create-game', quiz, (game: unknown) => {
                if (game) {
                    this.internalGame = game as Game;
                    this.currentQuestionIndex = 0;
                    subscriber.next(true);
                    subscriber.complete();
                } else {
                    subscriber.next(false);
                    subscriber.complete();
                }
            });
        });
    }

    private emitDeleteGame(): void {
        this.webSocketService.emit<string>('delete-game', this.internalGame.pin);
    }

    private emitKick(playerName: string): void {
        this.webSocketService.emit<RoomData<string>>('kick', { pin: this.internalGame.pin, data: playerName });
    }

    private emitStartGame(countdown: number): void {
        this.webSocketService.emit<RoomData<number>>('start-game', {
            pin: this.internalGame.pin,
            data: countdown,
        });
    }

    private emitNextQuestion(): void {
        const currentQuestion = this.getCurrentQuestion();
        if (!currentQuestion) {
            return;
        }

        this.webSocketService.emit<RoomData<NextQuestionEventData>>('next-question', {
            pin: this.internalGame.pin,
            data: {
                question: currentQuestion,
                countdown: this.internalGame.quiz.duration,
                histogram: this.internalHistograms[this.internalHistograms.length - 1],
            },
        });
    }

    private emitEndQuestion(): void {
        this.webSocketService.emit<string>('end-question', this.internalGame.pin);
    }

    private emitUpdateScores(): void {
        this.webSocketService.emit<RoomData<number>>(
            'update-scores',
            {
                pin: this.internalGame.pin,
                data: this.currentQuestionIndex,
            },
            (game: unknown) => {
                this.internalGame = game as Game;
            },
        );
    }

    private emitAnswer(): void {
        const currentAnswer = this.getCurrentAnswer();
        if (!currentAnswer) {
            return;
        }

        this.webSocketService.emit<RoomData<Answer[]>>('answer', {
            pin: this.internalGame.pin,
            data: currentAnswer,
        });
    }

    private emitEndGame(): void {
        this.webSocketService.emit<string>('end-game', this.internalGame.pin, (game: unknown) => {
            this.router.navigate(['/endgame'], { queryParams: { game: JSON.stringify(game) } });
            this.cleanUp();
        });
    }

    private onPlayerJoined(): void {
        this.webSocketService.onEvent<Player>('player-joined', (player) => {
            this.internalGame.players.push(player);
        });
    }

    private onPlayerLeft(): void {
        this.webSocketService.onEvent<PlayerLeftEventData>('player-left', (data) => {
            const { players, player } = data;
            this.internalGame.players = players;

            if (!this.gameStarted) {
                return;
            }

            this.internalQuitters.push(player);

            console.log(this.internalGame.players);
            if (this.internalGame.players.length === 0) {
                this.internalGameEndedSubject.next();
            }
        });
    }

    private onConfirmPlayerAnswer(): void {
        this.webSocketService.onEvent<void>('confirm-player-answer', () => {
            if (++this.internalNAnswered >= this.internalGame.players.length) {
                this.timeService.setTimeById(this.timerId, 0);
                this.internalNAnswered = 0;
            }
        });
    }

    private onPlayerUpdated(): void {
        this.webSocketService.onEvent('player-updated', (histogramdData: HistogramData) => {
            this.internalHistograms[this.internalHistograms.length - 1] = histogramdData;
        });
    }

    private getCurrentAnswer(): Answer[] | undefined {
        return this.getCurrentQuestion()?.choices.filter((answer) => answer.isCorrect);
    }

    private setupNextQuestion(): void {
        if (!this.getCurrentQuestion()) {
            return;
        }

        this.timeService.stopTimerById(this.timerId);
        this.timeService.startTimerById(this.timerId, this.internalGame.quiz.duration, this.endQuestion.bind(this));
    }
}
