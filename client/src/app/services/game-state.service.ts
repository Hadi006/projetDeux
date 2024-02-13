import { Injectable } from '@angular/core';
import { GameState } from '@common/constant';

@Injectable({
    providedIn: 'root',
})
export class GameStateService {
    gameState: GameState = GameState.ShowQuestion;
}
