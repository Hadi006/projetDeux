import { Component, HostListener } from '@angular/core';
import { Player } from '@common/player';
import { PlayerHandlerService } from '@app/services/player-handler.service';
import { Question } from '@common/quiz';

@Component({
    selector: 'app-question',
    templateUrl: './question.component.html',
    styleUrls: ['./question.component.scss'],
})
export class QuestionComponent {
    constructor(public playerHandlerService: PlayerHandlerService) {}

    @HostListener('window:keyup', ['$event'])
    handleKeyUp(event: KeyboardEvent): void {
        if (!this.getPlayer()) {
            return;
        }

        if (!this.canEditAnswer()) {
            return;
        }

        event.stopPropagation();
        this.playerHandlerService.handleKeyUp(event);
    }

    getPlayer(): Player | undefined {
        return this.playerHandlerService.player;
    }

    getQuestionData(): Question | undefined {
        const player = this.getPlayer();

        if (!player) {
            return;
        }

        return player.questions[player.questions.length - 1];
    }

    getIsChecked(): boolean[] {
        return this.playerHandlerService.getPlayerBooleanAnswers();
    }

    private canEditAnswer(): boolean {
        if (this.getQuestionData() && this.getQuestionData()?.type === 'QCM' && !this.playerHandlerService.answerConfirmed) {
            return true;
        }

        return false;
    }
}
