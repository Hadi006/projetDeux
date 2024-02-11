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
}
