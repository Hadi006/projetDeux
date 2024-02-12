import { Component, OnDestroy } from '@angular/core';
import { GameTimersService } from '@app/services/game-timers.service';

@Component({
    selector: 'app-game-timers',
    templateUrl: './game-timers.component.html',
    styleUrls: ['./game-timers.component.scss'],
})
export class GameTimersComponent implements OnDestroy {
    constructor(private gameTimersService: GameTimersService) {}

    get time(): number {
        return this.gameTimersService.time;
    }

    ngOnDestroy(): void {
        this.gameTimersService.resetTimers();
    }
}
