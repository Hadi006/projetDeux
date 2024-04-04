import { Component, HostListener } from '@angular/core';
import { PlayerService } from '@app/services/player/player.service';
import { Player } from '@common/player';
import { Question } from '@common/quiz';

@Component({
    selector: 'app-question',
    templateUrl: './question.component.html',
    styleUrls: ['./question.component.scss'],
})
export class QuestionComponent {
    constructor(public playerService: PlayerService) {}

    @HostListener('window:keyup', ['$event'])
    handleKeyUp(event: KeyboardEvent): void {
        if (!this.getPlayer()) {
            return;
        }

        if (!this.canEditAnswer()) {
            return;
        }

        event.stopPropagation();
        this.playerService.handleKeyUp(event);
    }

    getPlayer(): Player | undefined {
        return this.playerService.player;
    }

    getQuestionData(): Question | undefined {
        const player = this.getPlayer();

        if (!player) {
            return;
        }

        return player.questions[player.questions.length - 1];
    }

    getIsChecked(): boolean[] {
        return this.playerService.getPlayerBooleanAnswers();
    }

    handleTextareaInput(event: Event) {
        const target = event.target as HTMLTextAreaElement;
        this.playerService.qrlAnswer = target.value; // Update the qrlAnswer property in the PlayerService
    }

    private canEditAnswer(): boolean {
        if (this.getQuestionData() && this.getQuestionData()?.type === 'QCM' && !this.playerService.answerConfirmed) {
            return true;
        }

        return false;
    }
}
