import { Component, Input, OnInit } from '@angular/core';
import { GameHandlerService } from '@app/services/game-handler.service';

@Component({
    selector: 'app-gameplay-player-page',
    templateUrl: './gameplay-player-page.component.html',
    styleUrls: ['./gameplay-player-page.component.scss'],
})
export class GameplayPlayerPageComponent implements OnInit {
    @Input() gameId: number;

    constructor(public gameHandlerService: GameHandlerService) {}
    ngOnInit(): void {
        this.gameHandlerService.loadGameData();
        this.gameHandlerService.startGame();
    }
}
