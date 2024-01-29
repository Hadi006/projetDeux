import { Component, HostListener, Input } from '@angular/core';
import { QuestionData } from '@common/question-data';
import { Subject } from 'rxjs';

const GOOD_ANSWER_MULTIPLIER = 1.2;

@Component({
    selector: 'app-question',
    templateUrl: './question.component.html',
    styleUrls: ['./question.component.scss'],
})
export class QuestionComponent {
    @Input() answerConfirmed: boolean;
    @Input() showingAnswer: boolean;
    @Input() answerConfirmedNotifier: Subject<void>;

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
        this.answerConfirmedNotifier.next();
    }

    canEditAnswer(): boolean {
        return !this.answerConfirmed && !this.showingAnswer;
    }

    calculateGrade(): number {
        const maxGrade: number = this.questionData.points * GOOD_ANSWER_MULTIPLIER;
        if (!this.questionData.isMCQ) {
            return maxGrade;
        }

        let isCorrect = true;
        this.isChecked.forEach((checked: boolean, index: number) => {
            isCorrect = checked === this.questionData.correctAnswers.includes(this.questionData.answers[index]);
        });

        return isCorrect ? maxGrade : 0;
    }
}
