import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
    selector: 'app-prompt',
    templateUrl: './prompt.component.html',
    styleUrls: ['./prompt.component.scss'],
})
export class PromptComponent {
    userInput: string = '';

    constructor(
        public dialogRef: MatDialogRef<PromptComponent>,
        @Inject(MAT_DIALOG_DATA) public data: { message: string },
    ) {}

    onCancel(): void {
        this.dialogRef.close();
    }

    onConfirm(): void {
        this.dialogRef.close(this.userInput);
    }
}
