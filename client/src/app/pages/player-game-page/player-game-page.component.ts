import { Component, OnDestroy } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { PlayerService } from '@app/services/player.service';
import { Subscription } from 'rxjs';
import { AlertComponent } from '@app/components/alert/alert.component';

@Component({
    selector: 'app-player-game-page',
    templateUrl: './player-game-page.component.html',
    styleUrls: ['./player-game-page.component.scss'],
})
export class PlayerGamePageComponent implements OnDestroy {
    isCountingDown = true;

    private endGameSubscription: Subscription;

    constructor(
        private playerService: PlayerService,
        private dialog: MatDialog,
    ) {
        this.endGameSubscription = this.playerService.endGameSubject.subscribe(() => {
            this.dialog.open(AlertComponent, { data: { message: 'La partie est terminée' } });
        });
    }

    stopCountDown() {
        this.isCountingDown = false;
    }

    gameTitle() {
        return this.playerService.gameTitle;
    }

    leaveGame() {
        this.playerService.leaveGame();
    }

    ngOnDestroy() {
        this.endGameSubscription.unsubscribe();
    }
}
