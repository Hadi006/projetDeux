import { HttpResponse, HttpStatusCode } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { AlertComponent } from '@app/components/alert/alert.component';
import { CommunicationService } from '@app/services/communication/communication.service';
import { Quiz } from '@common/quiz';
import { Observable, map, of } from 'rxjs';

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

    checkQuizAvailability(quizId?: string): Observable<boolean> {
        if (!quizId) {
            return of(false);
        }

        return this.http.get<Quiz>(`quizzes/${quizId}`).pipe(
            map((response: HttpResponse<Quiz>) => {
                if (!response.body || response.status !== HttpStatusCode.Ok || !response.body.visible) {
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
