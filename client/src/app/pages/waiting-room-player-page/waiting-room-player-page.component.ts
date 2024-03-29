import { Component, HostListener, OnDestroy, OnInit } from '@angular/core';
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
    private startGameSubscription: Subscription;
    private endGameSubscription: Subscription;

    constructor(
        private playerService: PlayerService,
        private router: Router,
        private dialog: MatDialog,
    ) {
        this.startGameSubscription = this.playerService.startGameSubject.subscribe(() => {
            router.navigate(['game-player']);
        });
        this.endGameSubscription = this.playerService.endGameSubject.subscribe(() => {
            this.dialog.open(AlertComponent, { data: { message: "La partie n'existe plus" } });
        });
    }

    get pin() {
        return this.playerService.pin;
    }

    get gameTitle() {
        return this.playerService.gameTitle;
    }

    get players() {
        return this.playerService.players;
    }

    ngOnInit(): void {
        if (!this.playerService.pin) {
            this.router.navigate(['/home/join-game']);
        }
    }

    leaveGame() {
        this.playerService.leaveGame();
        this.playerService.cleanUp();
        this.router.navigate(['/']);
    }

    ngOnDestroy() {
        this.startGameSubscription.unsubscribe();
        this.endGameSubscription.unsubscribe();
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
}
