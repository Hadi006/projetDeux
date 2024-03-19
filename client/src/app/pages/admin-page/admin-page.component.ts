import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { PromptComponent } from '@app/components/prompt/prompt.component';
import { Action, ActionType } from '@common/action';
import { INVALID_INDEX } from '@common/constant';
import { Quiz } from '@common/quiz';
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

        const subscription = this.adminService.uploadQuiz(quizFile).subscribe((response: { quiz?: Quiz; errorLog: string }) => {
            if (!response.errorLog) {
                return;
            }
            if (response.errorLog.includes('titre déjà utilisé')) {
                this.promptForNewTitle();
            }

            this.dialog.open(AlertComponent, { data: { message: response.errorLog } });

            subscription.unsubscribe();
        });
    }

    goToQuizPage(index?: number) {
        this.adminService.setSelectedQuiz(index !== undefined ? index : INVALID_INDEX);
        this.router.navigate(['/home/admin/quizzes/quiz']);
    }

    handle(action : Action) {
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

    private promptForNewTitle() {
        const subscription = this.dialog.open(PromptComponent, { data: { message: 'Veuillez entrer un nouveau titre pour le quiz' } }).afterClosed().subscribe((newTitle: string) => {
            if (!newTitle) {
                return;
            }
            this.adminService.submitQuiz(undefined, newTitle).subscribe().unsubscribe();

            subscription.unsubscribe();
        });
    }
}
