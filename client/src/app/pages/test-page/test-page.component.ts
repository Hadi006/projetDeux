import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { HostService } from '@app/services/host.service';
import { PlayerService } from '@app/services/player.service';
import { Subscription } from 'rxjs';

@Component({
    selector: 'app-gameplay-player-page',
    templateUrl: './test-page.component.html',
    styleUrls: ['./test-page.component.scss'],
})
export class TestPageComponent implements OnInit, OnDestroy {
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
            this.router.navigate(['create-game']);
        });
    }

    ngOnInit(): void {
        this.playerService.handleSockets();
        this.playerService.joinGame(this.hostService.game.pin, 'Test').subscribe(() => {
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
