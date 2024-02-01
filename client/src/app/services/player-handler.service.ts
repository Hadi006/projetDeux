import { Injectable } from '@angular/core';
import { Player } from '@app/interfaces/player';
import { Subject } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class PlayerHandlerService {
    private internalPlayers: Map<number, Player> = new Map<number, Player>();
    private internalNPlayers: number = 0;
    private internalAnswerConfirmedSubject: Subject<void> = new Subject<void>();

    get players(): Map<number, Player> {
        return this.internalPlayers;
    }

    get nPlayers(): number {
        return this.internalNPlayers;
    }

    get answerConfirmedSubject(): Subject<void> {
        return this.internalAnswerConfirmedSubject;
    }

    createPlayer(): Player {
        const player: Player = {
            score: 0,
            answer: [],
            answerConfirmed: false,
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

    confirmPlayerAnswer(player: Player): void {
        this.internalAnswerConfirmedSubject.next();
        player.answerConfirmed = true;
    }
}
