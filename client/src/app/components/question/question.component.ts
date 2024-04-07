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
    lastModificationDate = new Date();
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
        if (!this.playerService.player) {
            return;
        }

        return this.playerService.player;
    }

    getTime(): number {
        if (this.playerService.player?.questions[this.playerService.player.questions.length - 1]?.type === 'QRL') {
            const wasActive = this.playerService.player.isActive;
            const isActive = new Date().getTime() - this.lastModificationDate.getTime() < 5000;
            if (wasActive !== isActive) {
                this.playerService.player.isActive = isActive;
                this.playerService.updatePlayer();
            }

        }

        return this.playerService.getTime();
    }

    setLastModificationDate(): void {
        this.lastModificationDate = new Date();
    }

    getLength(): number {
        return 200 - (this.playerService.player?.questions[this.playerService.player.questions.length - 1]?.qrlAnswer?.length || 0);
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

    private canEditAnswer(): boolean {
        if (this.getQuestionData() && this.getQuestionData()?.type === 'QCM' && !this.playerService.answerConfirmed) {
            return true;
        }

        return false;
    }
}
