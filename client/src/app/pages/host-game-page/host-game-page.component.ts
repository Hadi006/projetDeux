import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { AlertComponent } from '@app/components/alert/alert.component';
import { HostService } from '@app/services/host/host.service';
import { PlayerService } from '@app/services/player/player.service';
import { HistogramData } from '@common/histogram-data';
import { Subscription } from 'rxjs';

@Component({
    selector: 'app-host-game-page',
    templateUrl: './host-game-page.component.html',
    styleUrls: ['./host-game-page.component.scss'],
})
export class HostGamePageComponent implements OnInit, OnDestroy {
    isCountingDown = true;
    private gameEndedSubscription: Subscription;
    private histogramSubscription: Subscription;

    constructor(
        private hostService: HostService,
        private dialog: MatDialog,
        private router: Router,
        private playerService: PlayerService,
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

    updatePlayerActivity(): void {
        if (this.playerService.player) {
            this.hostService.updatePlayerActivity(this.playerService.player.name);
        }
    }

    // Method to calculate and update histogram data
    updateHistogramData(): void {
        const { activePlayers, inactivePlayers } = this.hostService.calculateActivityMetrics();

        // Prepare histogram data
        const newHistogramData: HistogramData = {
            labels: ['Active Players', 'Inactive Players'],
            datasets: [
                {
                    label: 'Player Activity',
                    data: [activePlayers, inactivePlayers],
                },
            ],
        };

        this.hostService.histograms.push(newHistogramData);
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
        if (this.histogramSubscription) {
            this.histogramSubscription.unsubscribe();
        }
    }
}
