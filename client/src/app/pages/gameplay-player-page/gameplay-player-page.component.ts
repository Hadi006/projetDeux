import { Component } from '@angular/core';
import { GameHandlerService } from '@app/services/game-handler.service';

@Component({
    selector: 'app-gameplay-player-page',
    templateUrl: './gameplay-player-page.component.html',
    styleUrls: ['./gameplay-player-page.component.scss'],
})
export class GameplayPlayerPageComponent {
    constructor(public gameHandler: GameHandlerService) {}
}
