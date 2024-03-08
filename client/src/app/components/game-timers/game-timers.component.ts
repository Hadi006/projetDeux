import { Component, OnDestroy } from '@angular/core';
import { GameManagementService } from '@app/services/game-management.service';

@Component({
    selector: 'app-game-timers',
    templateUrl: './game-timers.component.html',
    styleUrls: ['./game-timers.component.scss'],
})
export class GameTimersComponent implements OnDestroy {
    constructor(private gameManagementService: GameManagementService) {}

    get time(): number {
        return this.gameManagementService.time;
    }

    ngOnDestroy(): void {
        this.gameManagementService.resetTimers();
    }
}
