import { Injectable } from '@angular/core';
import { Player } from '@app/interfaces/player';
import { Subject, Observable, map, forkJoin } from 'rxjs';
import { AnswerValidatorService } from './answer-validator.service';

@Injectable({
    providedIn: 'root',
})
export class PlayerHandlerService {
    private internalPlayers: Map<number, Player> = new Map<number, Player>();
    private internalNPlayers: number = 0;
    private internalNAnswered: number = 0;
    private internalAllAnsweredSubject: Subject<void> = new Subject<void>();

    constructor(private answerValidatorService: AnswerValidatorService) {}

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

    validatePlayerAnswers(questionId: string): Observable<null> {
        const validationObservables: Observable<boolean>[] = [];

        this.internalPlayers.forEach((player) => {
            const validationObservable = this.answerValidatorService.validateAnswer(questionId, player.answer);

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
}
