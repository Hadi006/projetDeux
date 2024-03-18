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

@Injectable({
    providedIn: 'root',
})
export class HostService {
    private internalGame: Game;
    private internalNAnswered = 0;
    private internalQuestionEnded: boolean;
    private timerId: number;
    private internalQuestionEndedSubject = new Subject<void>(); // les subjects sont faits pour etre observes, ils devraient etre public
    private internalGameEndedSubject = new Subject<Game>(); // les subjects sont faits pour etre observes, ils devraient etre public
    private currentQuestionIndex: number;
    private internalQuitters: Player[] = [];
    private internalHistograms: HistogramData[] = [];

    constructor(
        private webSocketService: WebSocketService,
        private timeService: TimeService,
        private router: Router,
    ) {
        this.timerId = timeService.createTimerById();
    }

    get game() {
        return this.internalGame;
    }

    get nAnswered() {
        return this.internalNAnswered;
    }

    get questionEnded() {
        return this.internalQuestionEnded;
    }
    get questionEndedSubject() {
        return this.internalQuestionEndedSubject; // utilise public readonly a la place
    }

    get gameEndedSubject() {
        return this.internalGameEndedSubject; // utilise public readonly a la place
    }

    get quitters() {
        return this.internalQuitters;
    }

    get histograms() {
        return this.internalHistograms;
    }

    getTime() {
        return this.timeService.getTimeById(this.timerId);
    }

    getCurrentQuestion(): Question | undefined {
        return this.internalGame.quiz?.questions[this.currentQuestionIndex];
    }

    handleSockets() {
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

    leaveGame() {
        this.emitDeleteGame();
        this.cleanUp();
        this.router.navigate(['/']);
    }

    toggleLock() {
        this.internalGame.locked = !this.internalGame.locked;
        this.emitToggleLock();
    }

    kick(playerName: string) {
        this.emitKick(playerName);
    }

    startGame(countdown: number) {
        this.emitStartGame(countdown);

        this.timeService.stopTimerById(this.timerId);
        this.timeService.startTimerById(this.timerId, countdown, this.nextQuestion.bind(this));
    }

    nextQuestion() {
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

    endQuestion() {
        this.emitEndQuestion();
        this.emitUpdateScores();
        this.emitAnswer();
        this.internalQuestionEnded = true;
        this.internalQuestionEndedSubject.next();
        this.currentQuestionIndex++;
    }

    endGame() {
        this.router.navigate(['/endgame']);
        this.emitEndGame();
        // this.internalGameEndedSubject.next();
        // this.cleanUp();
    }

    cleanUp() {
        this.emitDeleteGame();
        this.internalHistograms = [];
        this.webSocketService.disconnect();
        this.timeService.stopTimerById(this.timerId);
    }

    private emitToggleLock() {
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

    private emitKick(playerName: string) {
        this.webSocketService.emit<RoomData<string>>('kick', { pin: this.internalGame.pin, data: playerName });
    }

    private emitStartGame(countdown: number) {
        this.webSocketService.emit<RoomData<number>>('start-game', {
            pin: this.internalGame.pin,
            data: countdown,
        });
    }

    private emitNextQuestion() {
        this.webSocketService.emit<RoomData<{ question?: Question; countdown?: number; histogram: HistogramData }>>('next-question', {
            pin: this.internalGame.pin,
            data: {
                question: this.getCurrentQuestion(),
                countdown: this.internalGame.quiz?.duration,
                histogram: this.internalHistograms[this.internalHistograms.length - 1],
            },
        });
    }

    private emitEndQuestion() {
        this.webSocketService.emit<string>('end-question', this.internalGame.pin);
    }

    private emitUpdateScores() {
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

    private emitAnswer() {
        this.webSocketService.emit<RoomData<Answer[]>>('answer', {
            pin: this.internalGame.pin,
            data: this.getCurrentAnswer(),
        });
    }

    private emitEndGame() {
        this.webSocketService.emit<string>('end-game', this.internalGame.pin, (game: unknown) => {
            this.router.navigate(['/endgame'], { queryParams: { game: JSON.stringify(game) } });
        });
    }

    private onPlayerJoined() {
        this.webSocketService.onEvent<Player>('player-joined', (player) => {
            this.internalGame.players.push(player);
        });
    }

    private onPlayerLeft() {
        this.webSocketService.onEvent<{ players: Player[]; player: Player }>('player-left', (data) => {
            const { players, player } = data;
            this.internalGame.players = players;

            if (this.currentQuestionIndex === 0) {
                return;
            }

            this.internalQuitters.push(player);

            if (this.internalGame.players.length === 0) {
                // this.endGame();
            }
        });
    }

    private onConfirmPlayerAnswer() {
        this.webSocketService.onEvent<void>('confirm-player-answer', () => {
            if (++this.internalNAnswered >= this.internalGame.players.length) {
                this.timeService.setTimeById(this.timerId, 0);
                this.internalNAnswered = 0;
            }
        });
    }

    private onPlayerUpdated() {
        this.webSocketService.onEvent('player-updated', (histogramdData: HistogramData) => {
            this.internalHistograms[this.internalHistograms.length - 1] = histogramdData;
        });
    }

    private getCurrentAnswer(): Answer[] {
        return this.getCurrentQuestion()?.choices.filter((answer) => answer.isCorrect) || [];
    }

    private setupNextQuestion() {
        if (!this.internalGame.quiz) {
            return;
        }

        if (!this.getCurrentQuestion()) {
            // this.endGame();
            return;
        }

        this.timeService.stopTimerById(this.timerId);
        this.timeService.startTimerById(this.timerId, this.internalGame.quiz?.duration, this.endQuestion.bind(this));
    }
}
