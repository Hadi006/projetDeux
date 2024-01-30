import { Component, HostListener, Input } from '@angular/core';
import { QuestionData } from '@common/question-data';
import { Player } from '@app/interfaces/player';

@Component({
    selector: 'app-question',
    templateUrl: './question.component.html',
    styleUrls: ['./question.component.scss'],
})
export class QuestionComponent {
    @Input() answerConfirmed: boolean;
    @Input() showingAnswer: boolean;
    @Input() player: Player;

    questionData: QuestionData;
    isChecked: boolean[];

    @Input() set question(data: QuestionData | undefined) {
        if (!data) {
            return;
        }

        this.questionData = data;
        this.isChecked = new Array(this.questionData.answers.length).fill(false);
        this.answerConfirmed = false;
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
        if (key >= 0 && key < this.questionData.answers.length) {
            this.isChecked[key] = !this.isChecked[key];
        }
    }

    confirmAnswer(): void {
        this.answerConfirmed = true;
        this.player.answerNotifier.next(this.isChecked);
    }

    canEditAnswer(): boolean {
        return !this.answerConfirmed && !this.showingAnswer;
    }
}
