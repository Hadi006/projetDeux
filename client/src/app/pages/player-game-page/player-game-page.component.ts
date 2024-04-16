import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { AlertComponent } from '@app/components/alert/alert.component';
import { ChatboxComponent } from '@app/components/chatbox/chatbox.component';
import { ConfirmationDialogComponent } from '@app/components/confirmation-dialog/confirmation-dialog.component';
import { PlayerService } from '@app/services/player/player.service';
import { Subscription } from 'rxjs';

@Component({
    selector: 'app-player-game-page',
    templateUrl: './player-game-page.component.html',
    styleUrls: ['./player-game-page.component.scss'],
})
export class PlayerGamePageComponent implements OnInit, OnDestroy {
    @ViewChild(ChatboxComponent) chatbox: ChatboxComponent;

    isCountingDown = true;

    private endGameSubscription: Subscription;

    constructor(
        private playerService: PlayerService,
        private dialog: MatDialog,
        private router: Router,
    ) {
        this.endGameSubscription = this.playerService.endGameSubject.subscribe(() => {
            this.dialog.open(AlertComponent, { data: { message: "La partie n'existe plus" } });
        });
    }

    get players() {
        return this.playerService.players;
    }

    get name() {
        return this.playerService.player?.name || '';
    }

    stopCountDown() {
        this.isCountingDown = false;
    }

    gameTitle() {
        return this.playerService.gameTitle;
    }

    openConfirmationDialog(): void {
        const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
            width: '250px',
            data: 'Êtes-vous sûr de vouloir quitter cette partie?',
        });

        dialogRef.afterClosed().subscribe((result) => {
            if (result) {
                this.router.navigate(['/home']);
            }
        });
    }

    ngOnInit() {
        if (!this.playerService.isConnected() || this.playerService.gameEnded) {
            this.router.navigate(['/']);
        }
    }

    ngOnDestroy() {
        this.endGameSubscription.unsubscribe();
    }
}
