import { Injectable } from '@angular/core';

export enum GameState {
    ShowQuestion = 0,
    ShowAnswer = 1,
    GameEnded = 2,
}

@Injectable({
    providedIn: 'root',
})
export class GameStateService {
    constructor() {}
}
