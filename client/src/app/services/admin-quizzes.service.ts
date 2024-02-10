import { HttpResponse, HttpStatusCode } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Question, Quiz } from '@common/quiz';
import { BehaviorSubject } from 'rxjs';
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
}
