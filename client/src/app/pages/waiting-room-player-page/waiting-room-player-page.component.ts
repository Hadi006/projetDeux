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
        this.randomizePlayerImages();
    }

    ngOnDestroy() {
        this.startGameSubscription.unsubscribe();
        this.endGameSubscription.unsubscribe();
    }

    randomizePlayerImages(): void {
        // Define an array of image URLs
        const imageUrls = [
            'https://us-tuna-sounds-images.voicemod.net/e7bad044-1e0e-46c9-bc37-7cfffe3de120-1712161984981.png',
            'https://i.ytimg.com/vi/wYZux3BMc5k/maxresdefault.jpg',
            'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTjTOLAyE4xbnja5OYpZM1oASmTwRsqlg2aOUGUVd4siQ&s',
        ];

        // Randomly assign an image URL to each player
        this.playerService.players.forEach((player) => {
            const randomIndex = Math.floor(Math.random() * imageUrls.length);
            this.playerImages[player] = imageUrls[randomIndex];
        });
    }
}
