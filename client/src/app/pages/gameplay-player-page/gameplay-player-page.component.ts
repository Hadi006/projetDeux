import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { HostService } from '@app/services/host.service';
import { PlayerService } from '@app/services/player.service';
import { Subscription } from 'rxjs';

@Component({
    selector: 'app-gameplay-player-page',
    templateUrl: './gameplay-player-page.component.html',
    styleUrls: ['./gameplay-player-page.component.scss'],
})
export class GameplayPlayerPageComponent implements OnInit, OnDestroy {
    private questionEndedSubscription: Subscription;
    private gameEndedSubscription: Subscription;

    constructor(
        public playerService: PlayerService,
        private hostService: HostService,
        private router: Router,
    ) {
        this.questionEndedSubscription = this.hostService.questionEndedSubject.subscribe(() => {
            this.hostService.nextQuestion();
        });
        this.gameEndedSubscription = this.hostService.gameEndedSubject.subscribe(() => {
            this.router.navigate(['game']);
        });
    }

    ngOnInit(): void {
        if (!this.hostService.game.quiz) {
            this.router.navigate(['game']);
        }

        this.playerService.handleSockets();
        this.playerService.createPlayer(this.hostService.game.pin, 'Test').subscribe(() => {
            this.hostService.startGame(0);
        });
    }

    ngOnDestroy(): void {
        this.hostService.cleanUp();
        this.playerService.cleanUp();
        this.questionEndedSubscription.unsubscribe();
        this.gameEndedSubscription.unsubscribe();
    }
}
