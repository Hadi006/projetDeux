import { Component, OnDestroy } from '@angular/core';
import { HostService } from '@app/services/host.service';
import { PlayerService } from '@app/services/player.service';

@Component({
    selector: 'app-player',
    templateUrl: './player.component.html',
    styleUrls: ['./player.component.scss'],
})
export class PlayerComponent implements OnDestroy {
    constructor(
        public playerService: PlayerService,
        private hostService: HostService,
    ) {}

    ngOnDestroy(): void {
        this.hostService.cleanUp();
        this.playerService.cleanUp();
    }
}
