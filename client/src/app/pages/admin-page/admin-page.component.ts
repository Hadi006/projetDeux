import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
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
        private admin: AdminQuizzesService,
        private router: Router,
        private dialog: MatDialog,
    ) {}

    ngOnInit() {
        this.quizzes = this.admin.quizzes$;
        this.admin.fetchQuizzes();
    }

    importQuiz(event: Event) {
        const quizFile: File | undefined = (event.target as HTMLInputElement)?.files?.[0];
        if (!quizFile) {
            return;
        }

        this.admin.uploadQuiz(quizFile).subscribe((response: { quiz?: Quiz; errorLog: string }) => {
            if (!response.errorLog) {
                return;
            }

            this.dialog.open(AlertComponent, { data: { message: response.errorLog } });
        });
    }

    gotoQuizPage(index?: number) {
        const INVALID_INDEX = -1;
        this.admin.setSelectedQuiz(index !== undefined ? index : INVALID_INDEX);
        this.router.navigate(['/home/admin/quizzes/quiz']);
    }
}
