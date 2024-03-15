import { Injectable } from '@angular/core';
import { Game } from '@common/game';
import { WebSocketService } from './web-socket.service';
import { Observable, Subject } from 'rxjs';
import { Answer, Question, Quiz } from '@common/quiz';
import { TimeService } from './time.service';
import { INITIAL_QUESTION_INDEX, TRANSITION_DELAY } from '@common/constant';
import { Player } from '@common/player';

@Injectable({
    providedIn: 'root',
})
export class HostService {
    private internalGame: Game;
    private internalNAnswered = 0;
    private timerId: number;
    private internalQuestionEndedSubject = new Subject<void>();
    private internalGameEndedSubject = new Subject<void>();
    private currentQuestionIndex: number;

    constructor(
        private webSocketService: WebSocketService,
        private timeService: TimeService,
    ) {
        this.timerId = timeService.createTimerById();
    }

    get game() {
        return this.internalGame;
    }

    get nAnswered() {
        return this.internalNAnswered;
    }

    get questionEndedSubject() {
        return this.internalQuestionEndedSubject;
    }

    get gameEndedSubject() {
        return this.internalGameEndedSubject;
    }

    handleSockets() {
        if (!this.webSocketService.isSocketAlive()) {
            this.webSocketService.connect();
        }

        this.onPlayerJoined();
        this.onPlayerLeft();
        this.onConfirmPlayerAnswer();
    }

    createGame(quiz: Quiz): Observable<boolean> {
        return this.emitCreateGame(quiz);
    }

    startGame(countdown: number) {
        this.emitStartGame(countdown);

        this.internalGame.locked = true;
        this.timeService.stopTimerById(this.timerId);
        this.timeService.startTimerById(this.timerId, countdown, this.nextQuestion.bind(this));
    }

    nextQuestion() {
        this.currentQuestionIndex++;
        this.emitNextQuestion();
        this.timeService.stopTimerById(this.timerId);
        this.timeService.startTimerById(this.timerId, TRANSITION_DELAY, this.setupNextQuestion.bind(this));
    }

    endQuestion() {
        this.emitEndQuestion();
        this.emitUpdateScores();
        this.emitAnswer();
        this.internalQuestionEndedSubject.next();
    }

    endGame() {
        this.emitEndGame();
        this.internalGameEndedSubject.next();
    }

    cleanUp() {
        this.emitDeleteGame();
        this.webSocketService.disconnect();
        this.timeService.stopTimerById(this.timerId);
    }

    private emitCreateGame(quiz: Quiz): Observable<boolean> {
        return new Observable<boolean>((subscriber) => {
            this.webSocketService.emit('create-game', quiz, (game: unknown) => {
                if (game) {
                    this.internalGame = game as Game;
                    this.currentQuestionIndex = INITIAL_QUESTION_INDEX;
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
        this.webSocketService.emit('delete-game', this.internalGame.pin);
    }

    private emitStartGame(countdown: number) {
        this.webSocketService.emit('start-game', {
            pin: this.internalGame.pin,
            countdown,
        });
    }

    private emitNextQuestion() {
        this.webSocketService.emit('next-question', {
            pin: this.internalGame.pin,
            question: this.getCurrentQuestion(),
            countdown: this.internalGame.quiz?.duration,
        });
    }

    private emitEndQuestion() {
        this.webSocketService.emit('end-question', this.internalGame.pin);
    }

    private emitUpdateScores() {
        this.webSocketService.emit('update-scores', {
            pin: this.internalGame.pin,
            questionIndex: this.currentQuestionIndex,
        });
    }

    private emitAnswer() {
        this.webSocketService.emit('answer', {
            pin: this.internalGame.pin,
            answer: this.getCurrentAnswer(),
        });
    }

    private emitEndGame() {
        this.webSocketService.emit('end-game', this.internalGame.pin);
    }

    private onPlayerJoined() {
        this.webSocketService.onEvent('player-joined', (players: Player[]) => {
            this.internalGame.players = players;
        });
    }

    private onPlayerLeft() {
        this.webSocketService.onEvent('player-left', (players: Player[]) => {
            this.internalGame.players = players;
        });
    }

    private onConfirmPlayerAnswer() {
        this.webSocketService.onEvent('confirm-player-answer', () => {
            if (++this.internalNAnswered >= this.internalGame.players.length) {
                this.timeService.setTimeById(this.timerId, 0);
                this.internalNAnswered = 0;
            }
        });
    }

    private getCurrentQuestion(): Question | undefined {
        return this.internalGame.quiz?.questions[this.currentQuestionIndex];
    }

    private getCurrentAnswer(): Answer[] {
        return this.getCurrentQuestion()?.choices.filter((answer) => answer.isCorrect) || [];
    }

    private setupNextQuestion() {
        if (!this.internalGame.quiz) {
            return;
        }

        if (!this.getCurrentQuestion()) {
            this.endGame();
            return;
        }

        this.timeService.stopTimerById(this.timerId);
        this.timeService.startTimerById(this.timerId, this.internalGame.quiz?.duration, this.endQuestion.bind(this));
    }
}
