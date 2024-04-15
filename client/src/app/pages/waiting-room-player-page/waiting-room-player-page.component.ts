import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { AlertComponent } from '@app/components/alert/alert.component';
import { PlayerService } from '@app/services/player/player.service';
import { Subscription } from 'rxjs';

@Component({
    selector: 'app-waiting-room-player-page',
    templateUrl: './waiting-room-player-page.component.html',
    styleUrls: ['./waiting-room-player-page.component.scss'],
})
export class WaitingRoomPlayerPageComponent implements OnInit, OnDestroy {
    playerImages: { [key: string]: string } = {};
    private startGameSubscription: Subscription;
    private endGameSubscription: Subscription;

    constructor(
        private playerService: PlayerService,
        private router: Router,
        private dialog: MatDialog,
    ) {
        this.startGameSubscription = this.playerService.startGameSubject.subscribe(() => {
            if (this.playerService.gameId === '-1') {
                this.router.navigate(['host-player']);
            } else {
                this.router.navigate(['game-player']);
            }
        });
        this.endGameSubscription = this.playerService.endGameSubject.subscribe(() => {
            this.dialog.open(AlertComponent, { data: { message: "La partie n'existe plus" } });
        });
    }

    get pin() {
        return this.playerService.pin;
    }

    get player() {
        return this.playerService.player;
    }

    get gameTitle() {
        return this.playerService.gameTitle;
    }

    get players() {
        return this.playerService.players;
    }

    ngOnInit() {
        if (!this.playerService.isConnected() || this.playerService.gameStarted) {
            this.router.navigate(['/']);
        }
    }

    ngOnDestroy() {
        this.startGameSubscription.unsubscribe();
        this.endGameSubscription.unsubscribe();
    }
}
