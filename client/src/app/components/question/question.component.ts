import { Component, Input, OnChanges, HostListener } from '@angular/core';
import { QuestionData } from '@common/question-data';

@Component({
    selector: 'app-question',
    templateUrl: './question.component.html',
    styleUrls: ['./question.component.scss'],
})
export class QuestionComponent implements OnChanges {
    @Input() questionId: number;

    questionData: QuestionData;
    isChecked: boolean[];

    @HostListener('window:keyup', ['$event'])
    handleKeyUp(event: KeyboardEvent): void {
        event.stopPropagation();
        const key = parseInt(event.key, 10) - 1;

        if (key >= 0 && key < this.questionData.answers.length) {
            this.isChecked[key] = !this.isChecked[key];
        }
    }

    ngOnChanges(): void {
        this.getQuestionData();
        this.isChecked = new Array(this.questionData.answers.length);
    }

    getQuestionData(): void {
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
                points: 2,
                question: 'Quel est le résultat de 2 + 2 ?',
                answers: ['1', '2', '3', '4'],
                correctAnswers: ['4'],
                isMCQ: true,
            },
            {
                id: 2,
                points: 3,
                question: 'Quel est le résultat de 3 + 3 ?',
                answers: ['1', '2', '3', '6'],
                correctAnswers: ['6'],
                isMCQ: true,
            },
            {
                id: 3,
                points: 4,
                question: 'Quel est le résultat de 4 + 4 ?',
                answers: ['1', '2', '3', '8'],
                correctAnswers: ['8'],
                isMCQ: true,
            },
        ];

        this.questionData = testQuestions[this.questionId];
    }
}
