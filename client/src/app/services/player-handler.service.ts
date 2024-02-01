import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { Player } from '@app/interfaces/player';

@Injectable({
    providedIn: 'root',
})
export class PlayerHandlerService {
    private internalPlayers: Map<number, Player> = new Map<number, Player>();
    private internalNPlayers: number = 0;

    get players(): Map<number, Player> {
        return this.internalPlayers;
    }

    get nPlayers(): number {
        return this.internalNPlayers;
    }

    createPlayer(): Player {
        const player: Player = {
            score: 0,
            answerNotifier: new Subject<boolean[]>(),
        };
        this.internalPlayers.set(this.internalNPlayers++, player);

        return player;
    }

    cleanUp(): void {
        this.internalPlayers.forEach((player: Player) => {
            player.answerNotifier.unsubscribe();
        });
    }
}
