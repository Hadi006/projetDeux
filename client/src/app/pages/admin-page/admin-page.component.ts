import { Component, OnInit } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { PromptComponent } from '@app/components/prompt/prompt.component';
import { Action, ActionType } from '@common/action';
import { INVALID_INDEX } from '@common/constant';
import { Quiz } from '@common/quiz';
import { ValidationResult } from '@common/validation-result';
import { Observable } from 'rxjs';
import { AlertComponent } from 'src/app/components/alert/alert.component';
import { AdminQuizzesService } from 'src/app/services/admin-quizzes.service';

@Component({
    selector: 'app-admin-page',
    templateUrl: './admin-page.component.html',
    styleUrls: ['./admin-page.component.scss'],
})
export class AdminPageComponent implements OnInit {
    quizzes: Observable<Quiz[]>;

    constructor(
        private adminService: AdminQuizzesService,
        private router: Router,
        private dialog: MatDialog,
    ) {}

    ngOnInit() {
        this.quizzes = this.adminService.quizzes$;
        this.adminService.fetchQuizzes();
    }

    importQuiz(event: Event) {
        const quizFile: File | undefined = (event.target as HTMLInputElement)?.files?.[0];
        if (!quizFile) {
            return;
        }

        this.adminService.uploadQuiz(quizFile).subscribe((response: ValidationResult<Quiz>) => {
            if (!response.error) {
                return;
            }

            if (response.error.includes('titre déjà utilisé')) {
                this.promptForNewTitle()
                    .afterClosed()
                    .subscribe((newTitle: string) => {
                        if (!newTitle) {
                            return;
                        }
                        this.adminService.submitQuiz(response.data, newTitle).subscribe();
                    });
            }

            this.dialog.open(AlertComponent, { data: { message: response.error } });
        });
    }

    goToQuizPage(index?: number) {
        this.adminService.setSelectedQuiz(index !== undefined ? index : INVALID_INDEX);
        this.router.navigate(['/home/admin/quizzes/quiz']);
    }

    handle(action: Action) {
        switch (action.type) {
            case ActionType.CHANGE_VISIBILITY:
                this.adminService.changeQuizVisibility(action.target);
                break;
            case ActionType.EDIT:
                this.goToQuizPage(action.target);
                break;
            case ActionType.EXPORT:
                this.adminService.downloadQuiz(action.target);
                break;
            case ActionType.DELETE:
                this.adminService.deleteQuiz(action.target);
                break;
            default:
                break;
        }
    }

    private promptForNewTitle(): MatDialogRef<PromptComponent> {
        return this.dialog.open(PromptComponent, { data: { message: 'Veuillez entrer un nouveau titre pour le quiz' } });
    }
}
