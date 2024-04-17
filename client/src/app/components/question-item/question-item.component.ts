import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute } from '@angular/router';
import { ConfirmationDialogComponent } from '@app/components/confirmation-dialog/confirmation-dialog.component';
import { Action, ActionType } from '@common/action';
import { QuestionType } from '@common/constant';
import { Answer, Question } from '@common/quiz';

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
    component: {
        text: string;
        type: QuestionType.Qcm;
        choices: Answer[];
        qrlAnswer: string;
    };

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
        if (action === ActionType.EDIT) {
            message = 'Êtes-vous sûr de vouloir modifier cette question?';
        } else if (action === ActionType.DELETE) {
            message = 'Êtes-vous sûr de vouloir supprimer cette question?';
        }

        const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
            width: '250px',
            data: message,
        });

        dialogRef.afterClosed().subscribe((result) => {
            if (result && action === ActionType.EDIT) {
                this.onAction(ActionType.EDIT);
            } else if (result && action === ActionType.DELETE) {
                this.onAction(ActionType.DELETE);
            }
        });
    }

    private joinUrl(): string {
        return this.route.snapshot.url.join('/');
    }
}
