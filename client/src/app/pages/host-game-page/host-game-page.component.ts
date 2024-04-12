import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { AlertComponent } from '@app/components/alert/alert.component';
import { HostService } from '@app/services/host/host.service';
import { QCM_TIME_FOR_PANIC, QRL_TIME_FOR_PANIC } from '@common/constant';
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
            this.router.navigate(['/']);
        });
    }

    get game() {
        return this.hostService.game;
    }

    get histogramData() {
        return this.hostService.histograms[this.hostService.histograms.length - 1];
    }

    stopCountDown() {
        this.isCountingDown = false;
    }

    getCurrentQuestion() {
        return this.hostService.getCurrentQuestion();
    }

    getTime() {
        return this.hostService.getTime();
    }
    canActivatePanicMode(): boolean {
        return (
            (this.getCurrentQuestion()?.type === 'QCM' && this.getTime() >= QCM_TIME_FOR_PANIC) ||
            (this.getCurrentQuestion()?.type === 'QRL' && this.getTime() >= QRL_TIME_FOR_PANIC)
        );
    }
    pauseTimer() {
        return this.hostService.pauseTimer();
    }

    startPanicMode() {
        this.hostService.startPanicMode();
    }
    stopPanicMode() {
        this.hostService.stopPanicMode();
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
        return this.hostService.game?.players || [];
    }

    getQuitters() {
        return this.hostService.quitters;
    }

    ngOnInit() {
        if (!this.hostService.isConnected() || !this.hostService.getCurrentQuestion()) {
            this.router.navigate(['/']);
        }
    }

    ngOnDestroy() {
        this.gameEndedSubscription.unsubscribe();
    }
}
