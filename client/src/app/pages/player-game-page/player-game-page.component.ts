import { Component, HostListener, OnDestroy, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { AlertComponent } from '@app/components/alert/alert.component';
import { PlayerService } from '@app/services/player/player.service';
import { Subscription } from 'rxjs';

@Component({
    selector: 'app-player-game-page',
    templateUrl: './player-game-page.component.html',
    styleUrls: ['./player-game-page.component.scss'],
})
export class PlayerGamePageComponent implements OnInit, OnDestroy {
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

    ngOnInit(): void {
        if (!this.playerService.pin) {
            this.router.navigate(['/home/join-game']);
        }
    }

    @HostListener('window:beforeunload')
    onBeforeUnload() {
        this.playerService.emitLeaveGame();
    }

    @HostListener('window:popstate')
    onPopState() {
        this.playerService.emitLeaveGame();
        this.playerService.cleanUp();
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
