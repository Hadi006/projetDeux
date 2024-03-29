import { Component, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { HostService } from '@app/services/host/host.service';
import { PlayerService } from '@app/services/player/player.service';
import { Subscription } from 'rxjs';

@Component({
    selector: 'app-host-player-page',
    templateUrl: './host-player-page.component.html',
    styleUrls: ['./host-player-page.component.scss'],
})
export class HostPlayerPageComponent implements OnDestroy {
    private questionEndedSubscription: Subscription;
    private gameEndedSubscription: Subscription;

    constructor(
        private playerService: PlayerService,
        private hostService: HostService,
        private router: Router,
    ) {
        this.questionEndedSubscription = this.hostService.questionEndedSubject.subscribe(() => {
            this.hostService.nextQuestion();
        });
        this.gameEndedSubscription = this.hostService.gameEndedSubject.subscribe(() => {
            this.hostService.endGame();
        });
    }

    leaveGame() {
        this.hostService.cleanUp();
        this.playerService.cleanUp();
        this.router.navigate(['/']);
    }

    ngOnDestroy() {
        this.questionEndedSubscription.unsubscribe();
        this.gameEndedSubscription.unsubscribe();
    }
}
