import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmationDialogComponent } from '@app/components/confirmation-dialog/confirmation-dialog.component';
import { Action, ActionType } from '@common/action';
import { Quiz } from '@common/quiz';

@Component({
    selector: 'app-quiz-item',
    templateUrl: './quiz-item.component.html',
    styleUrls: ['./quiz-item.component.scss'],
})
export class QuizItemComponent {
    @Input() index: number;
    @Input() quiz: Quiz;
    @Output() action: EventEmitter<Action> = new EventEmitter();

    constructor(private dialog: MatDialog) {}

    onAction(actionType: string) {
        this.action.emit({ type: actionType as ActionType, target: this.index });
    }

    openConfirmationDialog(action: 'edit' | 'delete' | 'export'): void {
        let message = '';
        switch (action) {
            case 'edit': {
                message = 'Êtes-vous sûr de vouloir modifier ce quiz?';

                break;
            }
            case 'delete': {
                message = 'Êtes-vous sûr de vouloir supprimer ce quiz?';

                break;
            }
            case 'export': {
                message = 'Êtes-vous sûr de vouloir exporter ce quiz?';

                break;
            }
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
            } else if (result) {
                this.onAction('export');
            }
        });
    }
}
