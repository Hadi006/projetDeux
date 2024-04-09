import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { AlertComponent } from '@app/components/alert/alert.component';
import { HostService } from '@app/services/host/host.service';
import { SELECTED_MULTIPLIER } from '@common/constant';
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
    currentPlayerIndex = 0;
    selectedMultiplier = SELECTED_MULTIPLIER;
    shouldOpenEvaluationForm = false;

    private gameEndedSubscription: Subscription;
    private questionEndedSubscription: Subscription;

    constructor(
        public hostService: HostService,
        private dialog: MatDialog,
        private router: Router,
    ) {
        this.gameEndedSubscription = this.hostService.gameEndedSubject.subscribe(() => {
            this.dialog.open(AlertComponent, { data: { message: 'Tous les joueurs on quittés' } });
            this.router.navigate(['/']);
        });

        this.questionEndedSubscription = this.hostService.questionEndedSubject.subscribe(() => {
            if (!this.hostService.game) {
                return;
            }
            const currentQuestion = this.getTheRealCurrentQuestion();
            this.shouldOpenEvaluationForm = currentQuestion?.type === 'QRL';
        });
    }

    get game() {
        return this.hostService.game;
    }

    get histogramData() {
        return this.hostService.histograms[this.hostService.histograms.length - 1];
    }

    getTheRealCurrentQuestion() {
        if (!this.hostService.game) {
            return;
        }
        return this.hostService.game.quiz.questions[this.hostService.currentQuestionIndex - 1];
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

    getQrlEnded() {
        return this.shouldOpenEvaluationForm;
    }

    nextQuestion() {
        this.hostService.nextQuestion();
    }

    showEndGameResult() {
        this.hostService.endGame();
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

    getCurrentPlayer() {
        if (!this.hostService.game) {
            return new Player('', '');
        }
        return this.hostService.game.players
            .sort((a, b) => {
                return a.name.localeCompare(b.name);
            })
            .sort((a, b) => a.name.localeCompare(b.name))[this.currentPlayerIndex];
    }

    updatePlayerScore(multiplier: number) {
        if (!this.hostService.game) {
            return;
        }

        const currentQuestionPoints = this.getTheRealCurrentQuestion()?.points || 0;

        this.hostService.game.players[this.currentPlayerIndex].score += currentQuestionPoints * multiplier;
    }

    nextPlayer() {
        if (!this.hostService.game) {
            return;
        }
        const currentQuestionPoints = this.getTheRealCurrentQuestion()?.points || 0;
        this.hostService.game.players[this.currentPlayerIndex].score += currentQuestionPoints * this.selectedMultiplier;
        this.currentPlayerIndex++;
    }

    isTheLastPlayer() {
        if (!this.hostService.game) {
            return false;
        }
        return this.currentPlayerIndex >= this.hostService.game.players.length - 1;
    }

    sendEvaluationResults() {
        if (!this.hostService.game) {
            return;
        }
        const currentQuestionPoints = this.getTheRealCurrentQuestion()?.points || 0;
        this.hostService.game.players[this.currentPlayerIndex].score += currentQuestionPoints * this.selectedMultiplier;
        this.currentPlayerIndex = 0;
        this.shouldOpenEvaluationForm = false;
        this.hostService.updatePlayers();
    }

    ngOnInit() {
        if (!this.hostService.isConnected() || !this.hostService.getCurrentQuestion()) {
            this.router.navigate(['/']);
        }
    }

    ngOnDestroy() {
        this.gameEndedSubscription.unsubscribe();
        this.questionEndedSubscription.unsubscribe();
    }
}
