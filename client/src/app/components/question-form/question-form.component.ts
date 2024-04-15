import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { Component } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { AlertComponent } from '@app/components/alert/alert.component';
import { ConfirmationDialogComponent } from '@app/components/confirmation-dialog/confirmation-dialog.component';
import { AdminQuizzesService } from '@app/services/admin-quizzes/admin-quizzes.service';
import { Question } from '@common/quiz';
import { take } from 'rxjs/operators';

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
        this.question = JSON.parse(JSON.stringify(this.admin.selectedQuestion));
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

    submit() {
        this.admin
            .submitQuestion(this.question)
            .pipe(take(1))
            .subscribe((error: string) => {
                if (error) {
                    this.dialog.open(AlertComponent, { data: { message: error } });
                } else {
                    this.dialogRef.close(this.question);
                }
            });
    }
    openConfirmationDialog(index: number): void {
        const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
            width: '250px',
            data: 'Êtes-vous sûr de vouloir supprimer cette réponse ?',
        });

        dialogRef.afterClosed().subscribe((result) => {
            if (result) {
                this.removeChoice(index);
            }
        });
    }
}
