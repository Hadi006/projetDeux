import { HttpResponse, HttpStatusCode } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Player } from '@app/interfaces/player';
import { Subject, Observable, map, of, catchError, forkJoin } from 'rxjs';
import { CommunicationService } from './communication.service';

@Injectable({
    providedIn: 'root',
})
export class PlayerHandlerService {
    private internalPlayers: Map<number, Player> = new Map<number, Player>();
    private internalNPlayers: number = 0;
    private internalNAnswered: number = 0;
    private internalAllAnsweredSubject: Subject<void> = new Subject<void>();

    constructor(private communicationService: CommunicationService) {}

    get players(): Map<number, Player> {
        return this.internalPlayers;
    }

    get nPlayers(): number {
        return this.internalNPlayers;
    }

    get allAnsweredSubject(): Subject<void> {
        return this.internalAllAnsweredSubject;
    }

    createPlayer(): Player {
        const player: Player = {
            score: 0,
            answer: [],
            answerConfirmed: false,
            isCorrect: false,
        };
        this.internalPlayers.set(this.internalNPlayers++, player);

        return player;
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

        if (++this.internalNAnswered >= this.internalNPlayers) {
            this.internalAllAnsweredSubject.next();
            this.internalNAnswered = 0;
        }
    }

    resetPlayerAnswers(newAnswersLength: number): void {
        this.internalPlayers.forEach((player) => {
            player.answer = new Array(newAnswersLength).fill(false);
            player.answerConfirmed = false;
            player.isCorrect = false;
        });
    }

    validatePlayerAnswers(questionId: string): Observable<void> {
        const validationObservables: Observable<{ player: Player; response: HttpResponse<boolean> } | null>[] = Array.from(
            this.internalPlayers.values(),
        ).map((player) => {
            return this.communicationService.post<boolean>(`questions/${questionId}/validate-answer`, player.answer).pipe(
                map((response) => ({ player, response })),
                catchError(() => {
                    return of(null);
                }),
            );
        });

        return forkJoin(validationObservables).pipe(
            map((results) => {
                results.forEach((result) => {
                    if (result && result.response.status === HttpStatusCode.Ok) {
                        result.player.isCorrect = result.response.body || false;
                    }
                });
                return;
            }),
        );
    }
}
