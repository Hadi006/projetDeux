import { Injectable } from '@angular/core';
import { Player } from '@app/interfaces/player';
import { QuestionHandlerService } from './question-handler.service';

@Injectable({
    providedIn: 'root',
})
export class PlayerHandlerService {
    private internalPlayers: Map<number, Player> = new Map<number, Player>();
    private internalNPlayers: number = 0;
    private internalNAnswered: number = 0;

    constructor(private questionHandlerService: QuestionHandlerService) {}

    get players(): Map<number, Player> {
        return this.internalPlayers;
    }

    get nPlayers(): number {
        return this.internalNPlayers;
    }

    get nAnswered(): number {
        return this.internalNAnswered;
    }

    get allAnswered(): boolean {
        return this.internalNAnswered >= this.internalNPlayers;
    }

    createPlayer(): Player {
        const player: Player = {
            score: 0,
            answer: [],
            answerConfirmed: false,
            confirmAnswer: this.confirmAnswer.bind(this),
        };
        this.internalPlayers.set(this.internalNPlayers++, player);

        return player;
    }

    private confirmAnswer(): void {
        this.internalNAnswered++;

        if (this.allAnswered) {
            this.updateScores();
        }
    }

    private updateScores(): void {
        this.internalPlayers.forEach((player: Player) => {
            const score = this.questionHandlerService.calculateScore(player.answer);
            player.score += score;
        });
    }
}
