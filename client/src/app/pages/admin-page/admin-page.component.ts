import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
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

        this.adminService.uploadQuiz(quizFile).subscribe((response: { quiz?: Quiz; errorLog: string }) => {
            if (!response.errorLog) {
                return;
            }

            this.dialog.open(AlertComponent, { data: { message: response.errorLog } });
        });
    }

    gotoQuizPage(index?: number) {
        this.adminService.setSelectedQuiz(index !== undefined ? index : INVALID_INDEX);
        this.router.navigate(['/home/admin/quizzes/quiz']);
    }

    handle(action: { type: string; quizIndex: number }) {
        switch (action.type) {
            case 'change visibility':
                this.adminService.changeQuizVisibility(action.quizIndex);
                break;
            case 'edit':
                this.gotoQuizPage(action.quizIndex);
                break;
            case 'export':
                this.adminService.downloadQuiz(action.quizIndex);
                break;
            case 'delete':
                this.adminService.deleteQuiz(action.quizIndex);
                break;
            default:
                break;
        }
    }
}
