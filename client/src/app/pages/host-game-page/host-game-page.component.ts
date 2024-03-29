import { Component, HostListener, OnDestroy, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { AlertComponent } from '@app/components/alert/alert.component';
import { HostService } from '@app/services/host/host.service';
import { Subscription } from 'rxjs';

@Component({
    selector: 'app-host-game-page',
    templateUrl: './host-game-page.component.html',
    styleUrls: ['./host-game-page.component.scss'],
})
export class HostGamePageComponent implements OnInit, OnDestroy {
    isCountingDown = true;

    private gameEndedSubscription: Subscription;

    constructor(
        private hostService: HostService,
        private dialog: MatDialog,
        private router: Router,
    ) {
        this.gameEndedSubscription = this.hostService.gameEndedSubject.subscribe(() => {
            this.dialog.open(AlertComponent, { data: { message: 'Tous les joueurs on quittés' } });
            this.hostService.leaveGame();
        });
    }

    get histogramData() {
        return this.hostService.histograms[this.hostService.histograms.length - 1];
    }

    ngOnInit(): void {
        if (!this.hostService.game) {
            this.router.navigate(['/home/create-game']);
        }
    }

    @HostListener('window:beforeunload')
    onBeforeUnload() {
        this.hostService.emitDeleteGame();
    }

    @HostListener('window:popstate')
    onPopState() {
        this.hostService.cleanUp();
    }

    stopCountDown() {
        this.isCountingDown = false;
    }

    getGame() {
        return this.hostService.game;
    }

    getCurrentQuestion() {
        return this.hostService.getCurrentQuestion();
    }

    getTime() {
        return this.hostService.getTime();
    }

    getQuestionEnded() {
        return this.hostService.questionEnded;
    }

    nextQuestion() {
        this.hostService.nextQuestion();
    }

    showEndGameResult() {
        this.hostService.endGame();
    }

    getPlayers() {
        return this.hostService.game.players;
    }

    getQuitters() {
        return this.hostService.quitters;
    }

    leaveGame() {
        this.hostService.leaveGame();
    }

    ngOnDestroy() {
        this.gameEndedSubscription.unsubscribe();
    }
}
