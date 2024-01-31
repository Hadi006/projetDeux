import { Injectable } from '@angular/core';
import { QuestionHandlerService } from './question-handler.service';

export enum GameState {
    ShowQuestion = 0,
    ShowAnswer = 1,
    GameEnded = 2,
}

@Injectable({
    providedIn: 'root',
})
export class GameStateService {
    private internalGameState: GameState;

    constructor(questionHandlerService: QuestionHandlerService) {}

    get gameState(): GameState {
        return this.internalGameState;
    }
}
