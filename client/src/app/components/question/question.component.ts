import { Component, HostListener, Input } from '@angular/core';
import { QuestionData } from '@common/question-data';

const MAX_GRADE = 100;

@Component({
    selector: 'app-question',
    templateUrl: './question.component.html',
    styleUrls: ['./question.component.scss'],
})
export class QuestionComponent {
    @Input() answerConfirmed: boolean;
    @Input() showingAnswer: boolean;

    questionData: QuestionData;
    isChecked: boolean[];

    @Input() set question(data: QuestionData | undefined) {
        if (!data) {
            return;
        }

        this.questionData = data;
        this.isChecked = new Array(this.questionData.answers.length).fill(false);
    }

    @HostListener('window:keyup', ['$event'])
    handleKeyUp(event: KeyboardEvent): void {
        if (!this.questionData || !this.questionData.isMCQ || this.answerConfirmed) {
            return;
        }

        const key = parseInt(event.key, 10) - 1;
        if (key >= 0 && key < this.questionData.answers.length) {
            event.stopPropagation();
            this.isChecked[key] = !this.isChecked[key];
        }
    }

    calculateGrade(): number {
        if (!this.questionData.isMCQ) {
            return MAX_GRADE;
        }

        const grade = this.questionData.answers.reduce((acc, answer, index) => {
            const pointsPerAnswer = MAX_GRADE / this.questionData.answers.length;

            if (this.isChecked[index] === this.questionData.correctAnswers.includes(answer)) {
                return acc + pointsPerAnswer;
            } else {
                return acc - pointsPerAnswer;
            }
        }, 0);

        return grade < 0 ? 0 : grade;
    }
}
