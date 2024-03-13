import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { HostService } from '@app/services/host.service';
import { PlayerHandlerService } from '@app/services/player-handler.service';
import { Subscription } from 'rxjs';

@Component({
    selector: 'app-gameplay-player-page',
    templateUrl: './gameplay-player-page.component.html',
    styleUrls: ['./gameplay-player-page.component.scss'],
})
export class GameplayPlayerPageComponent implements OnInit, OnDestroy {
    private questionEndedSubscription: Subscription;

    constructor(
        public playerHandlerService: PlayerHandlerService,
        private hostService: HostService,
        private router: Router,
    ) {
        this.questionEndedSubscription = this.hostService.questionEndedSubject.subscribe(() => {
            this.hostService.nextQuestion();
        });
    }

    ngOnInit(): void {
        if (!this.hostService.lobbyData.quiz) {
            this.router.navigate(['game']);
        }

        this.playerHandlerService.handleSockets();
        this.playerHandlerService.createPlayer(this.hostService.lobbyData.id, 'Test').subscribe(() => {
            this.hostService.startGame(0);
        });
    }

    ngOnDestroy(): void {
        this.hostService.cleanUp();
        this.playerHandlerService.cleanUp();
        this.questionEndedSubscription.unsubscribe();
    }
}
