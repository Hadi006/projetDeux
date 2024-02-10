import { Injectable } from '@angular/core';

export const enum GameState {
    ShowQuestion = 0,
    ShowAnswer = 1,
    GameEnded = 2,
}

@Injectable({
    providedIn: 'root',
})
export class GameStateService {
    gameState: GameState = GameState.ShowQuestion;
}
