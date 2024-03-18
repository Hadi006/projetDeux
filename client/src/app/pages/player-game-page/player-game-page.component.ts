import { Component, OnDestroy } from '@angular/core';
// import { MatDialog } from '@angular/material/dialog';
import { PlayerService } from '@app/services/player.service';
import { Subscription } from 'rxjs';
// import { AlertComponent } from '@app/components/alert/alert.component';
@Component({
    selector: 'app-player-game-page',
    templateUrl: './player-game-page.component.html',
    styleUrls: ['./player-game-page.component.scss'],
})
export class PlayerGamePageComponent implements OnDestroy {
    isCountingDown = true;

    private endGameSubscription: Subscription;

    constructor(
        private playerService: PlayerService, // private dialog: MatDialog,
    ) {
        this.endGameSubscription = this.playerService.endGameSubject.subscribe(() => {
            // this.dialog.open(AlertComponent, { data: { message: "La partie n'existe plus" } });
        });
    }

    stopCountDown() {
        this.isCountingDown = false;
    }

    gameTitle() {
        return this.playerService.gameTitle;
    }

    // eslint-disable-next-line @typescript-eslint/member-ordering
    get players() {
        return this.playerService.players;
    }

    ngOnDestroy() {
        this.endGameSubscription.unsubscribe();
    }
}
