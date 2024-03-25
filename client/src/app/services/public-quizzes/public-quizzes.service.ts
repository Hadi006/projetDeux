import { HttpResponse, HttpStatusCode } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { AlertComponent } from '@app/components/alert/alert.component';
import { CommunicationService } from '@app/services/communication/communication.service';
import { N_RANDOM_QUESTIONS, RANDOM_QUIZ_DURATION, RANDOM_QUIZ_ID } from '@common/constant';
import { Question, Quiz } from '@common/quiz';
import { Observable, map, of, forkJoin } from 'rxjs';

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
        const randomQuizObservable: Observable<Quiz | undefined> = this.createRandomQuiz();
        const visibleQuizzesObservable: Observable<HttpResponse<Quiz[]>> = this.http.get<Quiz[]>('quizzes/visible');

        return forkJoin([randomQuizObservable, visibleQuizzesObservable]).pipe(
            map(([randomQuiz, response]) => {
                if (!response.body || response.status !== HttpStatusCode.Ok) {
                    return;
                }

                this.internalQuizzes = [];

                if (randomQuiz) {
                    this.internalQuizzes.push(randomQuiz);
                }

                this.internalQuizzes = this.internalQuizzes.concat(response.body);
            }),
        );
    }

    checkQuizAvailability(quizId?: string): Observable<boolean> {
        if (!quizId) {
            return of(false);
        }

        return this.fetchVisibleQuizzes().pipe(
            map(() => {
                return !!this.internalQuizzes.find((quiz) => quiz.id === quizId);
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

    private createRandomQuiz(): Observable<Quiz | undefined> {
        return this.http.get<Question[]>('questions').pipe(
            map((response: HttpResponse<Question[]>) => {
                if (!response.body || response.status !== HttpStatusCode.Ok) {
                    return;
                }

                if (response.body.length < N_RANDOM_QUESTIONS) {
                    return;
                }

                const quiz = new Quiz();
                quiz.id = RANDOM_QUIZ_ID;
                quiz.title = 'Mode aléatoire';
                quiz.visible = true;
                quiz.description = 'Mode aléatoire';
                quiz.duration = RANDOM_QUIZ_DURATION;

                return quiz;
            }),
        );
    }
}
