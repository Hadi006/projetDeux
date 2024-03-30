import { Component, OnDestroy, OnInit } from '@angular/core';
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
        });
    }

    get histogramData() {
        return this.hostService.histograms[this.hostService.histograms.length - 1];
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

    ngOnInit() {
        if (!this.hostService.isConnected()) {
            this.router.navigate(['/']);
        }
    }

    ngOnDestroy() {
        this.gameEndedSubscription.unsubscribe();
    }
}
