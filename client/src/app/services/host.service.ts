import { Injectable } from '@angular/core';
import { LobbyData } from '@common/lobby-data';
import { WebSocketService } from './web-socket.service';
import { Observable /* , Subject */, Subject } from 'rxjs';
import { Answer, Question, Quiz } from '@common/quiz';
import { TimeService } from './time.service';
import { INITIAL_QUESTION_INDEX, TRANSITION_DELAY } from '@common/constant';

@Injectable({
    providedIn: 'root',
})
export class HostService {
    private internalLobbyData: LobbyData;
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

    get lobbyData() {
        return this.internalLobbyData;
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

        this.onConfirmPlayerAnswer();
    }

    createLobby(quiz: Quiz): Observable<boolean> {
        return this.emitCreateLobby(quiz);
    }

    startGame(countdown: number) {
        this.emitStartGame(countdown);

        this.internalLobbyData.locked = true;
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
        this.emitDeleteLobby();
        this.webSocketService.disconnect();
        this.timeService.stopTimerById(this.timerId);
    }

    private emitCreateLobby(quiz: Quiz): Observable<boolean> {
        return new Observable<boolean>((subscriber) => {
            this.webSocketService.emit('create-lobby', quiz, (lobbyData: unknown) => {
                if (lobbyData) {
                    this.internalLobbyData = lobbyData as LobbyData;
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

    private emitDeleteLobby(): void {
        this.webSocketService.emit('delete-lobby', this.internalLobbyData.id);
    }

    private emitStartGame(countdown: number) {
        this.webSocketService.emit('start-game', {
            lobbyId: this.internalLobbyData.id,
            countdown,
        });
    }

    private emitNextQuestion() {
        this.webSocketService.emit('next-question', {
            lobbyId: this.internalLobbyData.id,
            question: this.getCurrentQuestion(),
            countdown: this.lobbyData.quiz?.duration,
        });
    }

    private emitEndQuestion() {
        this.webSocketService.emit('end-question', this.internalLobbyData.id);
    }

    private emitUpdateScores() {
        this.webSocketService.emit('update-scores', {
            lobbyId: this.internalLobbyData.id,
            questionIndex: this.currentQuestionIndex,
        });
    }

    private emitAnswer() {
        this.webSocketService.emit('answer', {
            lobbyId: this.internalLobbyData.id,
            answer: this.getCurrentAnswer(),
        });
    }

    private emitEndGame() {
        this.webSocketService.emit('end-game', this.internalLobbyData.id);
    }

    private onConfirmPlayerAnswer() {
        this.webSocketService.onEvent('confirm-player-answer', () => {
            if (++this.internalNAnswered >= this.internalLobbyData.players.length) {
                this.timeService.setTimeById(this.timerId, 0);
                this.internalNAnswered = 0;
            }
        });
    }

    private getCurrentQuestion(): Question | undefined {
        return this.internalLobbyData.quiz?.questions[this.currentQuestionIndex];
    }

    private getCurrentAnswer(): Answer[] {
        return this.getCurrentQuestion()?.choices.filter((answer) => answer.isCorrect) || [];
    }

    private setupNextQuestion() {
        if (!this.internalLobbyData.quiz) {
            return;
        }

        if (!this.getCurrentQuestion()) {
            this.endGame();
            return;
        }

        this.timeService.stopTimerById(this.timerId);
        this.timeService.startTimerById(this.timerId, this.internalLobbyData.quiz?.duration, this.endQuestion.bind(this));
    }
}
