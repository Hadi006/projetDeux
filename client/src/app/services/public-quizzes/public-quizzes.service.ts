import { HttpResponse, HttpStatusCode } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { AlertComponent } from '@app/components/alert/alert.component';
import { CommunicationService } from '@app/services/communication/communication.service';
import { N_RANDOM_QUESTIONS } from '@common/constant';
import { Question, Quiz } from '@common/quiz';
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
                if (!response.body || response.status !== HttpStatusCode.Ok) {
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
                return !!response.body && response.status === HttpStatusCode.Ok && response.body.visible;
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
                const shuffledQuestions = this.getShuffledQuestions(response.body);

                for (let i = 0; i < N_RANDOM_QUESTIONS; i++) {
                    quiz.questions.push(shuffledQuestions[i]);
                }

                return quiz;
            }),
        );
    }

    private getShuffledQuestions(questions: Question[]): Question[] {
        for (let i = questions.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [questions[i], questions[j]] = [questions[j], questions[i]];
        }

        return questions;
    }
}
