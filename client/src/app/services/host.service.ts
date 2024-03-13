import { Injectable } from '@angular/core';
import { LobbyData } from '@common/lobby-data';
import { WebSocketService } from './web-socket.service';
import { Observable /* , Subject */ } from 'rxjs';
import { QuestionHandlerService } from './question-handler.service';
import { Quiz } from '@common/quiz';
import { TimeService } from './time.service';
import { TRANSITION_DELAY } from '@common/constant';

@Injectable({
    providedIn: 'root',
})
export class HostService {
    private internalLobbyData: LobbyData;
    private internalNAnswered = 0;
    private timerId: number;

    constructor(
        private webSocketService: WebSocketService,
        private questionHandlerService: QuestionHandlerService,
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

    handleSockets() {
        this.webSocketService.connect();
        this.onStartGame();
        this.onConfirmPlayerAnswer();
        this.onNextQuestion();
    }

    createLobby(quiz: Quiz): Observable<boolean> {
        return this.emitCreateLobby(quiz);
    }

    startGame(countdown: number) {
        this.webSocketService.emit('start-game', {
            lobbyId: this.internalLobbyData.id,
            countdown,
        });
    }

    nextQuestion() {
        this.emitNextQuestion();
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
                    this.questionHandlerService.questions = quiz.questions;
                    this.questionHandlerService.currentQuestionIndex = 0;
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

    private emitNextQuestion() {
        this.webSocketService.emit('next-question', {
            lobbyId: this.internalLobbyData.id,
            question: this.questionHandlerService.getCurrentQuestion(),
            countdown: this.lobbyData.quiz?.duration,
        });
    }

    private emitEndQuestion() {
        this.webSocketService.emit('end-question', this.internalLobbyData.id);
        this.webSocketService.emit('update-scores', {
            lobbyId: this.internalLobbyData.id,
            questionIndex: this.questionHandlerService.currentQuestionIndex - 1,
        });
    }

    private onStartGame() {
        this.webSocketService.onEvent('start-game', (countdown: number) => {
            this.internalLobbyData.locked = true;
            this.timeService.startTimerById(this.timerId, countdown, this.nextQuestion.bind(this));
        });
    }

    private onNextQuestion() {
        this.webSocketService.onEvent('next-question', ({ countdown }: { question: unknown; countdown: number }) => {
            this.questionHandlerService.currentQuestionIndex++;
            this.timeService.startTimerById(this.timerId, TRANSITION_DELAY, this.setupNextQuestion.bind(this, countdown));
        });
    }

    private onConfirmPlayerAnswer() {
        this.webSocketService.onEvent('confirm-player-answer', () => {
            if (++this.internalNAnswered >= this.internalLobbyData.players.length) {
                this.timeService.stopTimerById(this.timerId);
                this.emitEndQuestion();
                this.internalNAnswered = 0;
            }
        });
    }

    private setupNextQuestion(countdown: number) {
        this.timeService.startTimerById(this.timerId, countdown, this.emitEndQuestion.bind(this));
    }
}
