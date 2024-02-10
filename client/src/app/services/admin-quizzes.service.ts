import { HttpResponse, HttpStatusCode } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Question, Quiz } from '@common/quiz';
import { BehaviorSubject, Observable, map, switchMap } from 'rxjs';
import { CommunicationService } from './communication.service';
const INVALID_INDEX = -1;

@Injectable({
    providedIn: 'root',
})
export class AdminQuizzesService {
    selectedQuestion: Question;
    readonly quizzes$: BehaviorSubject<Quiz[]>;
    private quizzes: Quiz[] = [];

    private selectedQuizIndex: number = INVALID_INDEX;

    constructor(private http: CommunicationService) {
        this.quizzes$ = new BehaviorSubject<Quiz[]>(this.quizzes);
        this.selectedQuestion = {
            id: '',
            text: '',
            type: 'multiple-choice',
            points: 0,
            choices: [
                { text: '', isCorrect: false },
                { text: '', isCorrect: false },
            ],
        };
    }

    fetchQuizzes() {
        this.http.get<Quiz[]>('quizzes').subscribe((response: HttpResponse<Quiz[]>) => {
            if (!response.body || response.status !== HttpStatusCode.Ok || !Array.isArray(response.body)) {
                return;
            }
            this.quizzes = response.body;
            this.quizzes$.next(this.quizzes);
        });
    }

    setSelectedQuiz(quizIndex: number) {
        this.selectedQuizIndex = quizIndex;
    }

    getSelectedQuiz(): Quiz {
        const SELECTED_QUIZ: Quiz | undefined = this.quizzes[this.selectedQuizIndex];
        this.selectedQuizIndex = -1;

        if (SELECTED_QUIZ) {
            return SELECTED_QUIZ;
        }

        const BLANK_QUIZ: Quiz = {
            id: '',
            title: '',
            visible: false,
            description: '',
            duration: 10,
            lastModification: new Date(),
            questions: [],
        };

        return BLANK_QUIZ;
    }

    uploadQuiz(quizFile: File): Observable<{ quiz?: Quiz; errorLog: string }> {
        return this.readQuizFile(quizFile).pipe(switchMap((quiz: unknown) => this.submitQuiz(quiz)));
    }

    submitQuiz(quiz: unknown): Observable<{ quiz?: Quiz; errorLog: string }> {
        return this.http.post<{ quiz: Quiz; errorLog: string }>('quizzes', { quiz }).pipe(
            map((response: HttpResponse<{ quiz: Quiz; errorLog: string }>) => {
                if (!response.body || response.body.errorLog === undefined || !response.body.quiz) {
                    return { quiz: undefined, errorLog: 'submission failed' };
                }

                if (response.body.errorLog) {
                    return response.body;
                }

                this.quizzes.push(response.body.quiz);
                this.quizzes$.next(this.quizzes);

                return response.body;
            }),
        );
    }

    updateQuiz(quiz: Quiz): Observable<{ quiz?: Quiz; errorLog: string }> {
        return this.http.patch<{ quiz: Quiz; errorLog: string }>(`quizzes/${quiz.id}`, { quiz }).pipe(
            map((response: HttpResponse<{ quiz: Quiz; errorLog: string }>) => {
                if (!response.body) {
                    return { quiz: undefined, errorLog: 'update failed' };
                }

                if (response.body.errorLog) {
                    return response.body;
                }

                const INDEX: number = this.quizzes.findIndex((q: Quiz) => q.id === quiz.id);
                this.quizzes[INDEX] = quiz;
                this.quizzes$.next(this.quizzes);

                return response.body;
            }),
        );
    }
}
