import { HttpResponse, HttpStatusCode } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { INVALID_INDEX } from '@common/constant';
import { Question, Quiz } from '@common/quiz';
import { BehaviorSubject, Observable, map, switchMap, of, catchError } from 'rxjs';
import { CommunicationService } from './communication.service';
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
            type: 'QCM',
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

    fetchVisibleQuizzes() {
        this.http.get<Quiz[]>('quizzes/visible').subscribe((response: HttpResponse<Quiz[]>) => {
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
        const selectedQuiz: Quiz | undefined = this.quizzes[this.selectedQuizIndex];
        this.selectedQuizIndex = -1;

        if (selectedQuiz) {
            return selectedQuiz;
        }

        const blankQuiz: Quiz = {
            id: '',
            title: '',
            visible: false,
            description: '',
            duration: 10,
            lastModification: new Date(),
            questions: [],
        };

        return blankQuiz;
    }

    uploadQuiz(quizFile: File): Observable<{ quiz?: Quiz; errorLog: string }> {
        return this.readQuizFile(quizFile).pipe(
            switchMap((quiz: unknown) => this.submitQuiz(quiz)),
            catchError(() => {
                return of({ quiz: undefined, errorLog: 'Error occurred while uploading quiz' });
            }),
        );
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

                this.quizzes[this.findQuizIndex(quiz.id)] = quiz;
                this.quizzes$.next(this.quizzes);

                return response.body;
            }),
        );
    }

    submitQuestion(question: Question): Observable<string> {
        return this.http.post<{ question: Question; compilationError: string }>('questions/validate', { question }).pipe(
            map((response) => {
                if (!response.body) {
                    return 'Server error';
                }

                if (response.status !== HttpStatusCode.Ok || response.body.compilationError) {
                    return response.body.compilationError;
                }

                return '';
            }),
        );
    }

    changeQuizVisibility(quizIndex: number) {
        const quiz: Quiz | undefined = this.quizzes[quizIndex];
        if (!quiz) return;

        quiz.visible = !quiz.visible;
        this.http.patch<string>(`quizzes/${quiz.id}/visibility`).subscribe();
    }

    /**
     * @source https://www.linkedin.com/pulse/how-download-file-using-httpclient-angular7-shah-faisal-
     */
    downloadQuiz(quizIndex: number) {
        if (!this.quizzes[quizIndex]) return;

        this.http.download(`quizzes/${this.quizzes[quizIndex].id}/download`).subscribe((response: Blob) => {
            // create a link
            const FILE_LINK = document.createElement('a');
            FILE_LINK.href = window.URL.createObjectURL(response);
            FILE_LINK.download = 'quiz.json';
            // simulate a click
            document.body.appendChild(FILE_LINK);
            FILE_LINK.click();
            document.body.removeChild(FILE_LINK);
        });
    }

    deleteQuiz(quizIndex: number) {
        const QUIZ: Quiz | undefined = this.quizzes[quizIndex];
        if (!QUIZ) return;

        this.quizzes = this.quizzes.filter((quiz: Quiz) => quiz.id !== QUIZ.id);
        this.quizzes$.next(this.quizzes);
        this.http.delete<string>(`quizzes/${QUIZ.id}`).subscribe();
    }

    private readQuizFile(quizFile: File): Observable<unknown> {
        return new Observable<unknown>((observer) => {
            const reader = new FileReader();
            reader.onload = (event) => {
                try {
                    const result = event.target?.result?.toString() || '';
                    const quiz = JSON.parse(result);
                    observer.next(quiz);
                } catch (error) {
                    observer.error({ errorLog: 'Invalid or empty quiz file' });
                }
                observer.complete();
            };
            reader.readAsText(quizFile);
        });
    }

    private findQuizIndex(quizId: string): number {
        return this.quizzes.findIndex((quiz: Quiz) => quiz.id === quizId);
    }
}
