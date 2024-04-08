import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { AlertComponent } from '@app/components/alert/alert.component';
import { HostService } from '@app/services/host/host.service';
import { Player } from '@common/player';
import { Subscription } from 'rxjs';

@Component({
    selector: 'app-host-game-page',
    templateUrl: './host-game-page.component.html',
    styleUrls: ['./host-game-page.component.scss'],
})
export class HostGamePageComponent implements OnInit, OnDestroy {
    isCountingDown = true;
    sort = 'name';
    order = 'asc';

    private gameEndedSubscription: Subscription;
    private histogramSubscription: Subscription;

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

    getQuestionEnded() {
        return this.hostService.questionEnded;
    }

    nextQuestion() {
        this.hostService.nextQuestion();
    }

    showEndGameResult() {
        this.hostService.endGame();
    }

    get players() {
        const players = this.game?.players || [];
        const quitters = this.hostService.quitters;
        const playersWithQuitters = [...players, ...quitters];
        switch (this.sort) {
            case 'name':
                return playersWithQuitters.sort((a, b) => {
                    return this.order === 'asc' ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name);
                });
            case 'score':
                return playersWithQuitters.sort((a, b) => {
                    if (a.score === b.score) {
                        return a.name.localeCompare(b.name);
                    }
                    return this.order === 'asc' ? a.score - b.score : b.score - a.score;
                });
            case 'color':
                const colorOrder = ['red', 'yellow', 'green', 'black'];
                return playersWithQuitters.sort((a, b) => {
                    if (this.getColor(a) === this.getColor(b)) {
                        return a.name.localeCompare(b.name);
                    }
                    return this.order === 'asc'
                        ? colorOrder.indexOf(this.getColor(a)) - colorOrder.indexOf(this.getColor(b))
                        : colorOrder.indexOf(this.getColor(b)) - colorOrder.indexOf(this.getColor(a));
                });
            default:
                return playersWithQuitters;
        }

    }

    sortBy(sort: string) {
        if (this.sort === sort) {
            this.order = this.order === 'asc' ? 'desc' : 'asc';
        } else {
            this.sort = sort;
            this.order = 'asc';
        }
    }

    getColor(player: Player): string {
        if (player.hasLeft) {
            return 'black';
        }
        if (player.hasConfirmedAnswer) {
            return 'green';
        }
        if (player.hasInteracted) {
            return 'yellow';
        }
        return 'red';
    }

    mutePlayer(player: string) {
        this.hostService.mute(player);
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
