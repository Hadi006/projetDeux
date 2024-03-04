import { Injectable } from '@angular/core';
import { Player } from '@common/player';
import { Subject, Observable, map, forkJoin } from 'rxjs';
import { NEW_PLAYER } from '@common/constant';
import { CommunicationService } from './communication.service';
import { HttpStatusCode } from '@angular/common/http';

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
        if (key >= 0 && key < player.answer.length) {
            player.answer[key] = !player.answer[key];
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

    resetPlayerAnswers(newAnswersLength: number): void {
        this.internalPlayers.forEach((player) => {
            player.answer = new Array(newAnswersLength).fill(false);
            player.answerConfirmed = false;
            player.isCorrect = false;
        });
    }

    validatePlayerAnswers(questionText: string): Observable<null> {
        const validationObservables: Observable<boolean>[] = [];

        this.internalPlayers.forEach((player) => {
            const validationObservable = this.validateAnswer(questionText, player.answer);

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

    removePlayer(playerId: number): void {
        this.internalPlayers = this.internalPlayers.filter((player) => player.id !== playerId);
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
