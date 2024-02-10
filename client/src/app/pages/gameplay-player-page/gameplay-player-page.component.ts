import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { GameHandlerService } from '@app/services/game-handler.service';
import { Subscription } from 'rxjs';

@Component({
    selector: 'app-gameplay-player-page',
    templateUrl: './gameplay-player-page.component.html',
    styleUrls: ['./gameplay-player-page.component.scss'],
})
export class GameplayPlayerPageComponent implements OnInit, OnDestroy {
    private gameEndedSubscription: Subscription;

    constructor(
        public gameHandlerService: GameHandlerService,
        private router: Router,
    ) {
        this.gameEndedSubscription = this.gameHandlerService.gameEnded$.subscribe(() => {
            this.router.navigate(['game']);
        });
    }

    ngOnInit(): void {
        this.gameHandlerService.startGame();
    }

    ngOnDestroy(): void {
        this.gameEndedSubscription.unsubscribe();
    }
}
