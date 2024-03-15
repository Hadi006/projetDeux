import { Component, OnDestroy } from '@angular/core';
import { PlayerService } from '@app/services/player.service';

@Component({
    selector: 'app-player',
    templateUrl: './player.component.html',
    styleUrls: ['./player.component.scss'],
})
export class PlayerComponent implements OnDestroy {
    constructor(public playerService: PlayerService) {}

    ngOnDestroy(): void {
        this.playerService.cleanUp();
    }
}
