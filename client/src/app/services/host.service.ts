import { Injectable } from '@angular/core';
import { LobbyData } from '@common/lobby-data';
import { WebSocketService } from './web-socket.service';
import { Observable } from 'rxjs';
import { Router } from '@angular/router';
import { QuestionHandlerService } from './question-handler.service';
import { Quiz } from '@common/quiz';

@Injectable({
    providedIn: 'root',
})
export class HostService {
    private internalLobbyData: LobbyData;

    constructor(
        private webSocketService: WebSocketService,
        private questionHandlerService: QuestionHandlerService,
        private router: Router,
    ) {}

    get lobbyData() {
        return this.internalLobbyData;
    }

    handleSockets() {
        this.onStartGame();
    }

    connect() {
        this.webSocketService.connect();
    }

    createLobby(quiz: Quiz): Observable<boolean> {
        return this.emitCreateLobby(quiz);
    }

    startGame() {
        this.webSocketService.emit('start-game', this.internalLobbyData.id);
    }

    nextQuestion() {
        this.emitNextQuestion();
    }

    cleanUp() {
        this.emitDeleteLobby().subscribe();
        this.webSocketService.disconnect();
        this.router.navigate(['/']);
    }

    private emitCreateLobby(quiz: Quiz): Observable<boolean> {
        return new Observable<boolean>((subscriber) => {
            this.webSocketService.emit('create-lobby', quiz, (lobbyData: unknown) => {
                if (lobbyData) {
                    this.internalLobbyData = lobbyData as LobbyData;
                    this.questionHandlerService.questionsData = quiz.questions;
                    subscriber.next(true);
                    subscriber.complete();
                } else {
                    subscriber.next(false);
                    subscriber.complete();
                }
            });
        });
    }

    private emitDeleteLobby(): Observable<void> {
        return new Observable<void>((subscriber) => {
            this.webSocketService.emit('delete-lobby', this.internalLobbyData.id, () => {
                subscriber.next();
                subscriber.complete();
            });
        });
    }

    private emitNextQuestion() {
        this.webSocketService.emit('next-question', {
            lobbyId: this.internalLobbyData.id,
            question: this.questionHandlerService.currentQuestion,
            countdown: this.lobbyData.quiz?.duration,
        });
        this.questionHandlerService.nextQuestion();
    }

    private onStartGame() {
        this.webSocketService.onEvent('start-game', () => {
            this.internalLobbyData.locked = true;
        });
    }
}
