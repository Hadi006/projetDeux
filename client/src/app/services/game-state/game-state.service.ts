import { Injectable } from '@angular/core';
import { Game } from '@common/game';

@Injectable({
    providedIn: 'root'
})
export class GameStateService {
    game: Game;
    constructor() { }
}
