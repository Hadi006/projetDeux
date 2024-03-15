import { Component, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { PlayerService } from '@app/services/player.service';
import { Subscription } from 'rxjs';

@Component({
    selector: 'app-waiting-room-player-page',
    templateUrl: './waiting-room-player-page.component.html',
    styleUrls: ['./waiting-room-player-page.component.scss'],
})
export class WaitingRoomPlayerPageComponent implements OnDestroy {
    private startGameSubscription: Subscription;

    constructor(
        private playerService: PlayerService,
        private router: Router,
    ) {
        this.startGameSubscription = this.playerService.startGameSubject.subscribe(() => {
            router.navigate(['game-player']);
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

    leaveGame() {
        this.playerService.leaveGame();
        this.playerService.cleanUp();
        this.router.navigate(['/']);
    }

    ngOnDestroy() {
        this.startGameSubscription.unsubscribe();
    }
}
