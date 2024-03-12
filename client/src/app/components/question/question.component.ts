import { Component, HostListener, Input } from '@angular/core';
import { Player } from '@common/player';
import { PlayerHandlerService } from '@app/services/player-handler.service';
import { QuestionHandlerService } from '@app/services/question-handler.service';
import { Answer, Question } from '@common/quiz';

@Component({
    selector: 'app-question',
    templateUrl: './question.component.html',
    styleUrls: ['./question.component.scss'],
})
export class QuestionComponent {
    @Input() player: Player | undefined;

    constructor(
        public playerHandlerService: PlayerHandlerService,
        private questionHandlerService: QuestionHandlerService,
    ) {}

    get questionData(): Question | undefined {
        if (!this.player) {
            return undefined;
        }

        return this.player.questions[this.player.questions.length - 1];
    }

    get correctAnswers(): Answer[] {
        return this.questionHandlerService.currentAnswers;
    }

    get isChecked(): boolean[] {
        return this.playerHandlerService.getPlayerBooleanAnswers();
    }

    @HostListener('window:keyup', ['$event'])
    handleKeyUp(event: KeyboardEvent): void {
        if (!this.player) {
            return;
        }

        if (!this.canEditAnswer()) {
            return;
        }

        event.stopPropagation();
        this.playerHandlerService.handleKeyUp(event, this.player);
    }

    private canEditAnswer(): boolean {
        if (this.questionData && this.questionData.type === 'QCM' && !this.playerHandlerService.answerConfirmed) {
            return true;
        }

        return false;
    }
}
