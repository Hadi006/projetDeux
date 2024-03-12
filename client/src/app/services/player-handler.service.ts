import { Injectable } from '@angular/core';
import { Player } from '@common/player';
import { Subject, Observable, map } from 'rxjs';
import { CommunicationService } from './communication.service';
import { HttpStatusCode } from '@angular/common/http';
import { Answer, Question } from '@common/quiz';
import { WebSocketService } from './web-socket.service';
import { TimeService } from './time.service';

@Injectable({
    providedIn: 'root',
})
export class PlayerHandlerService {
    private internalPlayer: Player;
    private timerId: number;
    private internalPlayers: string[] = [];
    private internalConfirmedSubject: Subject<boolean> = new Subject<boolean>();
    private internalAnsweredSubject: Subject<void> = new Subject<void>();

    constructor(
        private communicationService: CommunicationService,
        private webSocketService: WebSocketService,
        private timeService: TimeService,
    ) {
        this.timerId = timeService.createTimerById();
    }

    get player(): Player {
        return this.internalPlayer;
    }

    get players(): string[] {
        return this.internalPlayers;
    }

    get answerConfirmedSubject(): Subject<boolean> {
        return this.internalConfirmedSubject;
    }

    get allAnsweredSubject(): Subject<void> {
        return this.internalAnsweredSubject;
    }

    connect() {
        this.webSocketService.connect();
    }

    getPlayerAnswers(): Answer[] {
        return this.internalPlayer.questions[this.internalPlayer.questions.length - 1].choices;
    }

    getPlayerBooleanAnswers(): boolean[] {
        return this.getPlayerAnswers().map((answer) => answer.isCorrect);
    }

    handleSockets() {
        this.onStartGame();
        this.onNextQuestion();
    }

    joinGame(pin: string): Observable<string> {
        return new Observable<string>((observer) => {
            this.webSocketService.connect();
            this.webSocketService.emit('join-game', pin, (response) => {
                observer.next(response as string);
                observer.complete();
            });
        });
    }

    createPlayer(pin: string, playerName: string): Observable<string> {
        return new Observable<string>((observer) => {
            this.webSocketService.emit('create-player', { pin, playerName }, (response: unknown) => {
                const responseData = response as { player: Player; players: string[]; error: string };
                if (!responseData.error) {
                    this.internalPlayer = responseData.player;
                    this.internalPlayers = responseData.players;
                    this.handleSockets();
                }

                observer.next(responseData.error);
                observer.complete();
            });
        });
    }

    handleKeyUp(event: KeyboardEvent, player: Player): void {
        if (event.key === 'Enter') {
            this.confirmPlayerAnswer(player);
        }

        const key = parseInt(event.key, 10) - 1;
        if (key >= 0 && key < this.getPlayerAnswers().length) {
            this.getPlayerAnswers()[key].isCorrect = !this.getPlayerAnswers()[key].isCorrect;
        }
    }

    confirmPlayerAnswer(player: Player | undefined): void {
        if (!player) {
            return;
        }

        this.internalConfirmedSubject.next(true);
        this.internalAnsweredSubject.next();
    }

    validatePlayerAnswers(questionText: string, points: number): void {
        this.validateAnswer(questionText, this.getPlayerBooleanAnswers()).subscribe((isCorrect) => {
            this.internalPlayer.isCorrect = isCorrect;
            this.internalPlayer.score += isCorrect ? points : 0;
        });
    }

    private resetPlayerAnswers(question: Question): void {
        const resetQuestion = { ...question };
        resetQuestion.choices = question.choices.map((choice) => ({ ...choice, isCorrect: false }));
        this.internalPlayer.questions.push(resetQuestion);
        this.internalConfirmedSubject.next(false);
        this.internalPlayer.isCorrect = false;
    }

    private validateAnswer(text: string, answer: boolean[]): Observable<boolean> {
        return this.communicationService.post<boolean>('questions/validate-answer', { answer, text }).pipe(
            map((response) => {
                if (response.status !== HttpStatusCode.Ok) {
                    return false;
                }

                return response.body || false;
            }),
        );
    }

    private onStartGame() {
        this.webSocketService.onEvent<number>('start-game', (countdown: number) => {
            this.timeService.startTimerById(this.timerId, countdown);
        });
    }

    private onNextQuestion() {
        this.webSocketService.onEvent<{ question: Question; countdown: number }>('next-question', ({ question, countdown }) => {
            this.resetPlayerAnswers(question);
            this.timeService.startTimerById(this.timerId, countdown);
        });
    }
}
