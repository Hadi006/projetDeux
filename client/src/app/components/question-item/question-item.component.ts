import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute } from '@angular/router';
import { ConfirmationDialogComponent } from '@app/components/confirmation-dialog/confirmation-dialog.component';
import { Action, ActionType } from '@common/action';
import { Question } from '@common/quiz';

@Component({
    selector: 'app-question-item',
    templateUrl: './question-item.component.html',
    styleUrls: ['./question-item.component.scss'],
})
export class QuestionItemComponent {
    @Input() question: Question;
    @Input() index: number;
    @Output() action: EventEmitter<Action> = new EventEmitter();

    displayDate: boolean = false;
    component: { text: string; type: 'QCM'; choices: ({ text: string; isCorrect: false } | { text: string; isCorrect: true })[]; qrlAnswer: string };

    constructor(
        private route: ActivatedRoute,
        private dialog: MatDialog,
    ) {
        if (this.joinUrl() === 'home/admin/quizzes') {
            this.displayDate = true;
        }
    }

    onAction(actionType: string) {
        this.action.emit({ type: actionType as ActionType, target: this.index });
    }

    openConfirmationDialog(action: 'edit' | 'delete'): void {
        let message = '';
        if (action === 'edit') {
            message = 'Êtes-vous sûr de vouloir modifier cette question?';
        } else if (action === 'delete') {
            message = 'Êtes-vous sûr de vouloir supprimer cette question?';
        }

        const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
            width: '250px',
            data: message,
        });

        dialogRef.afterClosed().subscribe((result) => {
            if (result && action === 'edit') {
                this.onAction('edit');
            } else if (result && action === 'delete') {
                this.onAction('delete');
            }
        });
    }

    private joinUrl(): string {
        return this.route.snapshot.url.join('/');
    }
}
