import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { Player } from '@app/interfaces/player';

@Injectable({
    providedIn: 'root',
})
export class PlayerHandlerService {
    private playersMap: Map<number, Player> = new Map<number, Player>();
    private nbPlayers: number = 0;

    get players(): Map<number, Player> {
        return this.playersMap;
    }

    get nPlayers(): number {
        return this.nbPlayers;
    }

    createPlayer(): Player {
        const player: Player = {
            score: 0,
            answerNotifier: new Subject<boolean[]>(),
        };
        this.playersMap.set(this.nbPlayers++, player);

        return player;
    }

    cleanUp(): void {
        this.playersMap.forEach((player: Player) => {
            player.answerNotifier.unsubscribe();
        });
    }
}
