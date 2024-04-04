import { HttpResponse, HttpStatusCode } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { CommunicationService } from '@app/services/communication/communication.service';
import { BLANK_QUIZ, INVALID_INDEX } from '@common/constant';
import { Game } from '@common/game';
import { Question, Quiz } from '@common/quiz';
import { ValidationResult } from '@common/validation-result';
import { BehaviorSubject, Observable, catchError, map, of, switchMap } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class AdminQuizzesService {
    selectedQuestion: Question;
    readonly quizzes$: BehaviorSubject<Quiz[]>;
    readonly games$: BehaviorSubject<Game[]>;
    private quizzes: Quiz[];
    private games: Game[];

    private selectedQuizIndex: number;

    constructor(private http: CommunicationService) {
        this.selectedQuizIndex = INVALID_INDEX;
        this.quizzes = [];
        this.quizzes$ = new BehaviorSubject<Quiz[]>(this.quizzes);
        this.games = [];
        this.games$ = new BehaviorSubject<Game[]>(this.games);
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

    fetchGames() {
        this.http.get<Game[]>('games').subscribe((response: HttpResponse<Game[]>) => {
            if (!response.body || response.status !== HttpStatusCode.Ok) {
                return;
            }
            this.games = response.body;
            this.games$.next(this.games);
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

    deleteAllGames() {
        this.games = [];
        this.games$.next(this.games);
        this.http.delete<void>('games').subscribe();
    }

    deleteGame(gameIndex: number) {
        const game: Game | undefined = this.games[gameIndex];
        if (!game) return;

        this.games = this.games.filter((currentGame: Game) => currentGame.pin !== game.pin);
        this.games$.next(this.games);
        this.http.delete<string>(`games/${game.pin}`).subscribe();
    }

    sortGamesByName() {
        if (!this.games || this.games.length === 0) return;

        const isAscending = this.games.every((game: Game, index: number) => {
            return index === 0 || game.name >= this.games[index - 1].name;
        });

        this.games.sort((game1: Game, game2: Game) => {
            return !isAscending ? game1.name.localeCompare(game2.name) : game2.name.localeCompare(game1.name);
        });

        this.games$.next(this.games);
    }

    sortGamesByDate() {
        if (!this.games || this.games.length === 0) return;

        const isAscending = this.games.every((game: Game, index: number) => {
            return index === 0 || game.date >= this.games[index - 1].date;
        });

        this.games.sort((game1: Game, game2: Game) => {
            return !isAscending
                ? new Date(game1.date).getTime() - new Date(game2.date).getTime()
                : new Date(game2.date).getTime() - new Date(game1.date).getTime();
        });

        this.games$.next(this.games);
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
