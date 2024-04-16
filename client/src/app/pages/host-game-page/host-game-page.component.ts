import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { AlertComponent } from '@app/components/alert/alert.component';
import { ConfirmationDialogComponent } from '@app/components/confirmation-dialog/confirmation-dialog.component';
import { HostService } from '@app/services/host/host.service';
import { QCM_TIME_FOR_PANIC, QRL_TIME_FOR_PANIC, SELECTED_MULTIPLIER } from '@common/constant';
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
    isTimerPaused = false;

    private gameEndedSubscription: Subscription;
    private questionEndedSubscription: Subscription;

    constructor(
        public hostService: HostService,
        private dialog: MatDialog,
        private router: Router,
    ) {
        this.gameEndedSubscription = this.hostService.gameEndedSubject.subscribe(() => {
            this.dialog.open(AlertComponent, { data: { message: 'Tous les joueurs ont quitté' } });
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

    getPlayers() {
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
                return playersWithQuitters.sort((a, b) => {
                    const colorOrder = ['red', 'yellow', 'green', 'black'];
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
    canActivatePanicMode(): boolean {
        return (
            (this.getCurrentQuestion()?.type === 'QCM' && this.getTime() >= QCM_TIME_FOR_PANIC) ||
            (this.getCurrentQuestion()?.type === 'QRL' && this.getTime() >= QRL_TIME_FOR_PANIC)
        );
    }

    pauseTimer() {
        this.isTimerPaused = !this.isTimerPaused;
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

    openConfirmationDialog(): void {
        const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
            width: '250px',
            data: 'Êtes-vous sûr de vouloir quitter cette partie?',
        });

        dialogRef.afterClosed().subscribe((result) => {
            if (result) {
                this.router.navigate(['/home']);
            }
        });
    }

    ngOnDestroy() {
        this.gameEndedSubscription.unsubscribe();
        this.questionEndedSubscription.unsubscribe();
    }
}
