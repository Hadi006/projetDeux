import { Component, OnDestroy } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { AlertComponent } from '@app/components/alert/alert.component';
import { HostService } from '@app/services/host/host.service';
import { Subscription } from 'rxjs';

@Component({
    selector: 'app-host-game-page',
    templateUrl: './host-game-page.component.html',
    styleUrls: ['./host-game-page.component.scss'],
})
export class HostGamePageComponent implements OnDestroy {
    isCountingDown = true;

    private gameEndedSubscription: Subscription;

    constructor(
        private hostService: HostService,
        private dialog: MatDialog,
    ) {
        this.gameEndedSubscription = this.hostService.gameEndedSubject.subscribe(() => {
            this.dialog.open(AlertComponent, { data: { message: 'Tous les joueurs on quittés' } });
            this.hostService.leaveGame();
        });
    }

    get histogramData() {
        return this.hostService.histograms[this.hostService.histograms.length - 1];
    }
    stopCountDown() {
        this.stopPanicMode();
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
    // A mettre les constants dans common pour le temps.
    canActivatePanicMode(): boolean {
        return (
            (this.getCurrentQuestion()?.type === 'QCM' && this.getTime() >= 5) || (this.getCurrentQuestion()?.type === 'QRL' && this.getTime() >= 20)
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
