import { HttpResponse, HttpStatusCode } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { CommunicationService } from '@app/services/communication.service';
import { Quiz } from '@common/quiz';
import { AlertComponent } from '@app/components/alert/alert.component';
import { MatDialog } from '@angular/material/dialog';

@Injectable({
    providedIn: 'root',
})
export class PublicQuizzesService {
    private internalQuizzes: Quiz[] = [];

    constructor(
        private http: CommunicationService,
        private dialog: MatDialog,
    ) {}

    get quizzes(): Quiz[] {
        return this.internalQuizzes;
    }

    fetchVisibleQuizzes() {
        this.http.get<Quiz[]>('quizzes/visible').subscribe((response: HttpResponse<Quiz[]>) => {
            if (!response.body || response.status !== HttpStatusCode.Ok || !Array.isArray(response.body)) {
                return;
            }
            this.internalQuizzes = response.body;
        });
    }

    checkQuizAvailability(quiz: Quiz | undefined): boolean {
        if (!quiz) {
            return false;
        }

        this.fetchVisibleQuizzes();

        return this.quizzes.find((q) => q.id === quiz.id) !== undefined;
    }

    alertNoQuizAvailable() {
        this.dialog.open(AlertComponent, {
            data: {
                title: 'Erreur',
                message: 'Le questionnaire n\'est plus disponible',
            },
        });
    }
}
