import { Component, HostListener, Input } from '@angular/core';
import { QuestionData } from '@common/question-data';
import { Player } from '@app/interfaces/player';
import { QuestionHandlerService } from '@app/services/question-handler.service';
import { GameStateService, GameState } from '@app/services/game-state.service';

@Component({
    selector: 'app-question',
    templateUrl: './question.component.html',
    styleUrls: ['./question.component.scss'],
})
export class QuestionComponent {
    @Input() player: Player;

    constructor(
        private questionHandlerService: QuestionHandlerService,
        private gameStateService: GameStateService,
    ) {}

    get questionData(): QuestionData | undefined {
        return this.questionHandlerService.currentQuestion;
    }

    get isChecked(): boolean[] {
        return this.player.answer;
    }

    get showingAnswer(): boolean {
        return this.gameStateService.gameState === GameState.ShowAnswer;
    }

    @HostListener('window:keyup', ['$event'])
    handleKeyUp(event: KeyboardEvent): void {
        if (!this.questionData || !this.questionData.isMCQ || !this.canEditAnswer()) {
            return;
        }

        event.stopPropagation();
        if (event.key === 'Enter') {
            this.confirmAnswer();
        }

        const key = parseInt(event.key, 10) - 1;
        console.log(key, this.questionData.answers.length);
        if (key >= 0 && key < this.questionData.answers.length) {
            this.player.answer[key] = !this.player.answer[key];
        }
    }

    canEditAnswer(): boolean {
        return !this.player.answerConfirmed && !this.showingAnswer;
    }

    confirmAnswer(): void {
        this.player.confirmAnswer();
        this.player.answerConfirmed = true;
    }
}
