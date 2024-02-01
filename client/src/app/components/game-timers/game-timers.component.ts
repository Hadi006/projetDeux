import { Component, OnInit } from '@angular/core';
import { GameTimersService, QUESTION_DELAY } from '@app/services/game-timers.service';

@Component({
    selector: 'app-game-timers',
    templateUrl: './game-timers.component.html',
    styleUrls: ['./game-timers.component.scss'],
})
export class GameTimersComponent implements OnInit {
    constructor(private gameTimersService: GameTimersService) {}

    get time(): number {
        return this.gameTimersService.time;
    }

    ngOnInit(): void {
        this.gameTimersService.startQuestionTimer(QUESTION_DELAY);
    }
}
