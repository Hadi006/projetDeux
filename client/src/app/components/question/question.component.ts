import { Component, HostListener, OnDestroy } from '@angular/core';
import { Player } from '@common/player';
import { PlayerHandlerService } from '@app/services/player-handler.service';
import { QuestionHandlerService } from '@app/services/question-handler.service';
import { GameState } from '@common/constant';
import { Answer, Question } from '@common/quiz';
import { GameManagementService } from '@app/services/game-management.service';
import { Subscription } from 'rxjs';

@Component({
    selector: 'app-question',
    templateUrl: './question.component.html',
    styleUrls: ['./question.component.scss'],
})
export class QuestionComponent implements OnDestroy {
    player: Player;
    answerConfirmed = false;

    private answerConfirmedSubscription: Subscription;

    constructor(
        public playerHandlerService: PlayerHandlerService,
        private questionHandlerService: QuestionHandlerService,
        private gameManagementService: GameManagementService,
    ) {
        this.player = this.playerHandlerService.createPlayer();
        this.subscribeToAnswerConfirmed();
    }

    get questionData(): Question | undefined {
        return this.questionHandlerService.currentQuestion;
    }

    get correctAnswers(): Answer[] {
        return this.questionHandlerService.currentAnswers;
    }

    get isChecked(): boolean[] {
        return this.playerHandlerService.getPlayerBooleanAnswers();
    }

    get showingAnswer(): boolean {
        return this.gameManagementService.gameState === GameState.ShowAnswer;
    }

    @HostListener('window:keyup', ['$event'])
    handleKeyUp(event: KeyboardEvent): void {
        if (!this.questionData || !(this.questionData.type === 'QCM') || !this.canEditAnswer()) {
            return;
        }

        event.stopPropagation();
        this.playerHandlerService.handleKeyUp(event, this.player);
    }

    canEditAnswer(): boolean {
        return !this.answerConfirmed && !this.showingAnswer;
    }

    ngOnDestroy(): void {
        this.answerConfirmedSubscription.unsubscribe();
    }

    private subscribeToAnswerConfirmed(): void {
        this.answerConfirmedSubscription = this.playerHandlerService.answerConfirmedSubject.subscribe((answerConfirmed) => {
            this.answerConfirmed = answerConfirmed;
        });
    }
}
