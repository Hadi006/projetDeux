import { Component, Input, HostListener } from '@angular/core';
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
    @Input() questionIdValue: number;

    questionData: QuestionData;
    isChecked: boolean[];

    @Input() set questionId(value: number) {
        this.questionIdValue = value;
        this.getQuestionData();

        if (!this.questionData) {
            return;
        }

        this.isChecked = new Array(this.questionData.answers.length);
    }

    @HostListener('window:keyup', ['$event'])
    handleKeyUp(event: KeyboardEvent): void {
        if (!this.questionData.isMCQ || this.answerConfirmed) {
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
            if (!this.isChecked[index]) {
                return acc;
            }

            const correctAnswersLength = this.questionData.correctAnswers.length;
            const pointsPerAnswer = MAX_GRADE / correctAnswersLength;

            if (this.questionData.correctAnswers.includes(answer)) {
                return acc + pointsPerAnswer;
            } else {
                return acc - pointsPerAnswer;
            }
        }, 0);

        return grade < 0 ? 0 : grade;
    }

    private getQuestionData(): void {
        const testQuestions: QuestionData[] = [
            {
                id: 0,
                points: 1,
                question: 'Quel est le résultat de 1 + 1 ?',
                answers: ['1', '2', '3', '4'],
                correctAnswers: ['2'],
                isMCQ: true,
            },
            {
                id: 1,
                points: 4,
                question: 'Question réponse libre',
                answers: [],
                correctAnswers: [],
                isMCQ: false,
            },
            {
                id: 2,
                points: 2,
                question: 'Quel est le résultat de 2 + 2 ?',
                answers: ['1', '2', '3', '4'],
                correctAnswers: ['4'],
                isMCQ: true,
            },
        ];

        this.questionData = testQuestions[this.questionIdValue];
    }
}
