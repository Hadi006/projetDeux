import { HttpResponse, HttpStatusCode } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { CommunicationService } from '@app/services/communication.service';
import { Quiz } from '@common/quiz';
import { AlertComponent } from '@app/components/alert/alert.component';
import { MatDialog } from '@angular/material/dialog';
import { map, Observable, of } from 'rxjs';

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

    fetchVisibleQuizzes(): Observable<void> {
        return this.http.get<Quiz[]>('quizzes/visible').pipe(
            map((response: HttpResponse<Quiz[]>) => {
                if (!response.body || response.status !== HttpStatusCode.Ok || !Array.isArray(response.body)) {
                    return;
                }
                this.internalQuizzes = response.body;
            }),
        );
    }

    checkQuizAvailability(quiz: Quiz | undefined): Observable<boolean> {
        if (!quiz) {
            this.alertNoQuizAvailable('Aucun quiz sélectionné');
            return of(false);
        }

        return this.fetchVisibleQuizzes().pipe(
            map(() => {
                if (this.quizzes.length === 0) {
                    this.alertNoQuizAvailable('Quiz non disponible');
                    return false;
                }

                return true;
            }),
        );
    }

    alertNoQuizAvailable(message: string) {
        this.dialog.open(AlertComponent, {
            data: {
                title: 'Erreur',
                message,
            },
        });
    }
}
