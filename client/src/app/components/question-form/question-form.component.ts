import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { Component } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { AdminQuizzesService } from '@app/services/admin-quizzes.service';
import { Question } from '@common/quiz';

@Component({
    selector: 'app-question-form',
    templateUrl: './question-form.component.html',
    styleUrls: ['./question-form.component.scss'],
})
export class QuestionFormComponent {
    question: Question;

    constructor(
        private dialogRef: MatDialogRef<QuestionFormComponent>,
        private admin: AdminQuizzesService,
        private dialog: MatDialog,
    ) {
        this.question = { ...admin.selectedQuestion };
        // this.question.choices = this.question.choices.map((choice) => ({ ...choice }));
    }

    addChoice() {
        this.question.choices.push({ text: '', isCorrect: false });
    }

    removeChoice(index: number) {
        this.question.choices.splice(index, 1);
    }

    trackByFn(index: number) {
        return index;
    }

    drop(event: CdkDragDrop<Question[]>) {
        moveItemInArray(this.question.choices, event.previousIndex, event.currentIndex);
    }
}
