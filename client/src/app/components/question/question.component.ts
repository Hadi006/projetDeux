import { Component, HostListener } from '@angular/core';
import { PlayerService } from '@app/services/player/player.service';
import { INVALID_INDEX, MAX_QRL_LENGTH, POLL_RATE } from '@common/constant';
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
        if (!this.playerService.player) {
            return;
        }

        return this.playerService.player;
    }

    getTime(): number {
        if (!this.playerService.player) {
            return 0;
        }

        const question = this.playerService.player.questions[this.playerService.player.questions.length - 1];
        if (question && question.type === 'QRL' && this.playerService.getTime() > 0) {
            const wasActive = this.playerService.player.isActive;
            const isActive = new Date().getTime() - new Date(question.lastModification || '').getTime() < POLL_RATE;
            if (wasActive !== isActive) {
                this.playerService.player.isActive = isActive;
                this.playerService.updatePlayer();
            }
        }

        return this.playerService.getTime();
    }

    getLength(): number {
        return MAX_QRL_LENGTH - (this.playerService.player?.questions[this.playerService.player.questions.length - 1]?.qrlAnswer?.length || 0);
    }

    getQuestionData(): Question | undefined {
        const player = this.getPlayer();

        if (!player) {
            return;
        }

        return player.questions[player.questions.length - 1];
    }

    updatePlayer(): void {
        const player = this.getPlayer();
        if (!player) {
            return;
        }
        player.questions[player.questions.length - 1].lastModification = new Date();
        player.hasInteracted = true;
        if (player.questions[player.questions.length - 1].type === 'QCM') {
            this.playerService.updatePlayer();
        }
    }

    isWaitingForEvaluation(): boolean {
        return this.getQuestionData()?.type === 'QRL' && this.playerService.getTime() === 0 && this.playerService.qrlCorrect === INVALID_INDEX;
    }

    private canEditAnswer(): boolean {
        if (this.getQuestionData() && this.getQuestionData()?.type === 'QCM' && !this.playerService.answerConfirmed) {
            return true;
        }

        return false;
    }
}
