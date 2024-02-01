import { Injectable } from '@angular/core';
import { QuestionHandlerService } from '@app/services/question-handler.service';

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

    constructor(private questionHandlerService: QuestionHandlerService) {}

    get gameState(): GameState {
        return this.internalGameState;
    }

    nextState(): void {
        if (!this.questionHandlerService.currentQuestion) {
            this.internalGameState = GameState.GameEnded;
        } else {
            switch (this.internalGameState) {
                case GameState.ShowQuestion:
                    this.internalGameState = GameState.ShowAnswer;
                    break;
                case GameState.ShowAnswer:
                    this.internalGameState = GameState.ShowQuestion;
                    break;
                case GameState.GameEnded:
                    this.internalGameState = GameState.GameEnded;
                    break;
                default:
                    this.internalGameState = GameState.ShowQuestion;
                    break;
            }
        }
    }
}
