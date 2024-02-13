import { Component, HostListener, OnDestroy } from '@angular/core';
import { Player } from '@app/interfaces/player';
import { GameStateService } from '@app/services/game-state.service';
import { PlayerHandlerService } from '@app/services/player-handler.service';
import { QuestionHandlerService } from '@app/services/question-handler.service';
import { GameState } from '@common/constant';
import { Answer, Question } from '@common/quiz';

@Component({
    selector: 'app-question',
    templateUrl: './question.component.html',
    styleUrls: ['./question.component.scss'],
})
export class QuestionComponent implements OnDestroy {
    player: Player;

    constructor(
        public playerHandlerService: PlayerHandlerService,
        private questionHandlerService: QuestionHandlerService,
        private gameStateService: GameStateService,
    ) {
        this.player = this.playerHandlerService.createPlayer();
    }

    get questionData(): Question | undefined {
        return this.questionHandlerService.currentQuestion;
    }

    get correctAnswers(): Answer[] {
        return this.questionHandlerService.currentAnswers;
    }

    get isChecked(): boolean[] {
        return this.player.answer;
    }

    get showingAnswer(): boolean {
        return this.gameStateService.gameState === GameState.ShowAnswer;
    }

    @HostListener('window:keyup', ['$event'])
    handleKeyUp(event: KeyboardEvent): void {
        if (!this.questionData || !(this.questionData.type === 'multiple-choices') || !this.canEditAnswer()) {
            return;
        }

        event.stopPropagation();
        this.playerHandlerService.handleKeyUp(event, this.player);
    }

    canEditAnswer(): boolean {
        return !this.player.answerConfirmed && !this.showingAnswer;
    }

    ngOnDestroy(): void {
        this.playerHandlerService.removePlayer(this.player.id);
    }
}
