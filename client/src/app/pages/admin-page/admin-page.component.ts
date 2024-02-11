import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { Quiz } from '@common/quiz';
import { Observable } from 'rxjs';
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
}
