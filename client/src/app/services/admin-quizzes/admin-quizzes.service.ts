import { HttpResponse, HttpStatusCode } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BLANK_QUIZ, INVALID_INDEX } from '@common/constant';
import { Question, Quiz } from '@common/quiz';
import { ValidationResult } from '@common/validation-result';
import { BehaviorSubject, Observable, catchError, map, of, switchMap } from 'rxjs';
import { CommunicationService } from '@app/services/communication/communication.service';
@Injectable({
    providedIn: 'root',
})
export class AdminQuizzesService {
    selectedQuestion: Question;
    readonly quizzes$: BehaviorSubject<Quiz[]>;
    private quizzes: Quiz[];

    private selectedQuizIndex: number;

    constructor(private http: CommunicationService) {
        this.selectedQuizIndex = INVALID_INDEX;
        this.quizzes = [];
        this.quizzes$ = new BehaviorSubject<Quiz[]>(this.quizzes);
        this.selectedQuestion = new Question();
    }

    fetchQuizzes() {
        this.http.get<Quiz[]>('quizzes').subscribe((response: HttpResponse<Quiz[]>) => {
            if (!response.body || response.status !== HttpStatusCode.Ok) {
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

        return BLANK_QUIZ;
    }

    uploadQuiz(quizFile: File): Observable<ValidationResult<Quiz>> {
        return this.readQuizFile(quizFile).pipe(
            switchMap((quiz: unknown) => this.submitQuiz(quiz)),
            catchError(() => {
                return of(new ValidationResult<Quiz>('Error occurred while uploading quiz'));
            }),
        );
    }

    submitQuiz(quiz: unknown, newTitle?: string): Observable<ValidationResult<Quiz>> {
        return this.http.post<ValidationResult<Quiz>>('quizzes', { quiz, newTitle }).pipe(
            map((response: HttpResponse<ValidationResult<Quiz>>) => {
                if (!response.body || response.body.error === undefined || !response.body.data) {
                    return new ValidationResult<Quiz>('Submission failed');
                }

                if (response.body.error) {
                    return response.body;
                }

                if (this.verifyDuplicateTitle(response.body.data.title)) {
                    return new ValidationResult('titre déjà utilisé', response.body.data);
                }

                this.quizzes.push(response.body.data);
                this.quizzes$.next(this.quizzes);

                return response.body;
            }),
        );
    }

    updateQuiz(quiz: Quiz): Observable<ValidationResult<Quiz>> {
        return this.http.patch<ValidationResult<Quiz>>(`quizzes/${quiz.id}`, { quiz }).pipe(
            map((response: HttpResponse<ValidationResult<Quiz>>) => {
                if (!response.body) {
                    return new ValidationResult<Quiz>('update failed');
                }

                if (response.body.error) {
                    return response.body;
                }

                this.quizzes[this.findQuizIndex(quiz.id)] = quiz;
                this.quizzes$.next(this.quizzes);

                return response.body;
            }),
        );
    }

    submitQuestion(question: Question): Observable<string> {
        return this.http.post<ValidationResult<Question>>('questions/validate', { question }).pipe(
            map((response) => {
                if (!response.body) {
                    return 'Server error';
                }

                if (response.status !== HttpStatusCode.Ok || response.body.error) {
                    return response.body.error;
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
        const quiz: Quiz | undefined = this.quizzes[quizIndex];
        if (!quiz) return;

        this.http.download(`quizzes/${quiz.id}/download`).subscribe((response: Blob) => {
            const FILE_LINK = document.createElement('a');
            FILE_LINK.href = window.URL.createObjectURL(response);
            FILE_LINK.download = 'quiz.json';
            document.body.appendChild(FILE_LINK);
            FILE_LINK.click();
            document.body.removeChild(FILE_LINK);
        });
    }

    deleteQuiz(quizIndex: number) {
        const quiz: Quiz | undefined = this.quizzes[quizIndex];
        if (!quiz) return;

        this.quizzes = this.quizzes.filter((currentQuiz: Quiz) => currentQuiz.id !== quiz.id);
        this.quizzes$.next(this.quizzes);
        this.http.delete<string>(`quizzes/${quiz.id}`).subscribe();
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
                    observer.error({ error: 'Invalid or empty quiz file' });
                }
                observer.complete();
            };
            reader.readAsText(quizFile);
        });
    }

    private findQuizIndex(quizId: string): number {
        return this.quizzes.findIndex((quiz: Quiz) => quiz.id === quizId);
    }

    private verifyDuplicateTitle(title: string): boolean {
        return this.quizzes.some((quiz: Quiz) => quiz.title === title);
    }
}
