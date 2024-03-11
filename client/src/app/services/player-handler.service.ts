import { Injectable } from '@angular/core';
import { Player } from '@common/player';
import { Subject, Observable, map, forkJoin } from 'rxjs';
import { NEW_PLAYER } from '@common/constant';
import { CommunicationService } from './communication.service';
import { HttpStatusCode } from '@angular/common/http';
import { Answer, Question } from '@common/quiz';

@Injectable({
    providedIn: 'root',
})
export class PlayerHandlerService {
    private internalPlayers: Player[] = [];
    private internalNAnswered: number = 0;
    private internalAllAnsweredSubject: Subject<void> = new Subject<void>();

    constructor(private communicationService: CommunicationService) {}

    get players(): Player[] {
        return this.internalPlayers;
    }

    get allAnsweredSubject(): Subject<void> {
        return this.internalAllAnsweredSubject;
    }

    getPlayerAnswers(player: Player): Answer[] {
        return player.questions[player.questions.length - 1].choices;
    }

    getPlayerBooleanAnswers(player: Player): boolean[] {
        return this.getPlayerAnswers(player).map((answer) => answer.isCorrect);
    }

    createPlayer(): Player {
        const newPlayer = { ...NEW_PLAYER, id: this.internalPlayers.length };
        this.internalPlayers.push(newPlayer);

        return newPlayer;
    }

    handleKeyUp(event: KeyboardEvent, player: Player): void {
        if (event.key === 'Enter') {
            this.confirmPlayerAnswer(player);
        }

        const key = parseInt(event.key, 10) - 1;
        if (key >= 0 && key < this.getPlayerAnswers(player).length) {
            this.getPlayerAnswers(player)[key].isCorrect = !this.getPlayerAnswers(player)[key].isCorrect;
        }
    }

    confirmPlayerAnswer(player: Player | undefined): void {
        if (!player) {
            return;
        }

        player.answerConfirmed = true;

        if (++this.internalNAnswered >= this.internalPlayers.length) {
            this.internalAllAnsweredSubject.next();
            this.internalNAnswered = 0;
        }
    }

    updateScores(points: number): void {
        this.internalPlayers.forEach((player) => {
            if (player.isCorrect) {
                player.score += points;
            }
        });
    }

    resetPlayerAnswers(question: Question): void {
        this.internalPlayers.forEach((player) => {
            const resetQuestion = { ...question };
            resetQuestion.choices = question.choices.map((choice) => ({ ...choice, isCorrect: false }));
            player.questions.push(resetQuestion);
            player.answerConfirmed = false;
            player.isCorrect = false;
        });
    }

    validatePlayerAnswers(questionText: string): Observable<null> {
        const validationObservables: Observable<boolean>[] = [];

        this.internalPlayers.forEach((player) => {
            const validationObservable = this.validateAnswer(questionText, this.getPlayerBooleanAnswers(player));

            validationObservables.push(validationObservable);
            validationObservable.subscribe((isCorrect) => {
                player.isCorrect = isCorrect;
            });
        });

        return forkJoin(validationObservables).pipe(
            map(() => {
                return null;
            }),
        );
    }

    removePlayer(playerName: string): void {
        this.internalPlayers = this.internalPlayers.filter((player) => player.name !== playerName);
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
}
