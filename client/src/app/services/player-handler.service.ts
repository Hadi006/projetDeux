import { Injectable } from '@angular/core';
import { Player } from '@common/player';
import { Observable } from 'rxjs';
import { Answer, Question } from '@common/quiz';
import { WebSocketService } from './web-socket.service';
import { TimeService } from './time.service';
import { TRANSITION_DELAY } from '@common/constant';

@Injectable({
    providedIn: 'root',
})
export class PlayerHandlerService {
    player: Player;

    private pin: string;
    private timerId: number;
    private internalPlayers: string[] = [];
    private internalAnswerConfirmed: boolean = false;
    private internalShowingAnswer: boolean = false;

    constructor(
        private webSocketService: WebSocketService,
        private timeService: TimeService,
    ) {
        this.timerId = timeService.createTimerById();
    }

    get players(): string[] {
        return this.internalPlayers;
    }

    get answerConfirmed(): boolean {
        return this.internalAnswerConfirmed;
    }

    get showingAnswer(): boolean {
        return this.internalShowingAnswer;
    }

    getPlayerAnswers(): Answer[] {
        return this.player.questions[this.player.questions.length - 1].choices;
    }

    getPlayerBooleanAnswers(): boolean[] {
        return this.getPlayerAnswers().map((answer) => answer.isCorrect);
    }

    handleSockets() {
        this.webSocketService.connect();
        this.onStartGame();
        this.onEndQuestion();
        this.onNextQuestion();
        this.onNewScore();
    }

    joinGame(pin: string): Observable<string> {
        return new Observable<string>((observer) => {
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
                    this.player = responseData.player;
                    this.internalPlayers = responseData.players;
                    this.pin = pin;
                    this.handleSockets();
                }

                observer.next(responseData.error);
                observer.complete();
            });
        });
    }

    updatePlayer(): void {
        this.webSocketService.emit('update-player', { lobbyId: this.pin, player: this.player });
    }

    handleKeyUp(event: KeyboardEvent): void {
        if (event.key === 'Enter') {
            this.confirmPlayerAnswer();
        }

        const key = parseInt(event.key, 10) - 1;
        if (key >= 0 && key < this.getPlayerAnswers().length) {
            this.getPlayerAnswers()[key].isCorrect = !this.getPlayerAnswers()[key].isCorrect;
        }
    }

    confirmPlayerAnswer(): void {
        this.webSocketService.emit('confirm-player-answer', this.pin);
        this.internalAnswerConfirmed = true;
    }

    getTime(): number {
        return this.timeService.getTimeById(this.timerId);
    }

    cleanUp(): void {
        this.webSocketService.disconnect();
        this.timeService.stopTimerById(this.timerId);
    }

    private resetPlayerAnswers(question: Question): void {
        const resetQuestion = { ...question };
        resetQuestion.choices = question.choices.map((choice) => ({ ...choice, isCorrect: false }));
        this.player.questions.push(resetQuestion);
        this.internalAnswerConfirmed = false;
        this.player.isCorrect = false;
        this.updatePlayer();
    }

    private onStartGame() {
        this.webSocketService.onEvent<number>('start-game', (countdown) => {
            this.timeService.startTimerById(this.timerId, countdown);
        });
    }

    private onEndQuestion() {
        this.webSocketService.onEvent<void>('end-question', () => {
            this.internalAnswerConfirmed = true;
            this.internalShowingAnswer = true;
            this.timeService.setTimeById(this.timerId, 0);
        });
    }

    private onNextQuestion() {
        this.webSocketService.onEvent<{ question: Question; countdown: number }>('next-question', ({ question, countdown }) => {
            this.timeService.startTimerById(this.timerId, TRANSITION_DELAY, this.setupNextQuestion.bind(this, question, countdown));
        });
    }

    private onNewScore() {
        this.webSocketService.onEvent<Player>('new-score', (player) => {
            if (player.name === this.player.name) {
                this.player = player;
            }
        });
    }

    private setupNextQuestion(question: Question, countdown: number): void {
        this.resetPlayerAnswers(question);
        this.timeService.startTimerById(this.timerId, countdown);
    }
}
