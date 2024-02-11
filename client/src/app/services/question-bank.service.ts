import { Injectable } from '@angular/core';
import { Question } from '@common/quiz';
import { BehaviorSubject } from 'rxjs';
import { CommunicationService } from './communication.service';

@Injectable({
    providedIn: 'root',
})
export class QuestionBankService {
    readonly questions$: BehaviorSubject<Question[]>;
    private questions: Question[] = [];

    constructor(private http: CommunicationService) {
        this.questions$ = new BehaviorSubject<Question[]>(this.questions);
    }

    fetchQuestions() {
        this.http.get<Question[]>('questions').subscribe((response) => {
            this.questions = response.body || [];
            this.questions$.next(this.questions);
        });
    }

    getQuestion(index: number): Question {
        const QUESTION: Question | undefined = this.questions[index];
        return (
            QUESTION || {
                id: '',
                text: '',
                type: 'multiple-choice',
                points: 0,
                choices: [
                    { text: '', isCorrect: false },
                    { text: '', isCorrect: false },
                ],
            }
        );
    }

    addQuestion(question: Question): Observable<string> {
        return this.http.post<{ question: Question; compilationError: string }>('questions', { question }).pipe(
            map((response) => {
                if (!response.body) {
                    return 'Server error';
                }

                if (response.body.compilationError) {
                    return response.body.compilationError;
                }

                this.questions.push(response.body.question);
                this.questions$.next(this.questions);

                return '';
            }),
        );
    }

    updateQuestion(question: Question): Observable<string> {
        return this.http.patch<{ question: Question; compilationError: string }>(`questions/${question.id}`, { question }).pipe(
            map((response) => {
                if (!response.body || !response.body.question || response.body.compilationError === undefined) {
                    return 'Server error';
                }

                if (response.body.compilationError) {
                    return response.body.compilationError;
                }

                const INDEX: number = this.questions.findIndex((q: Question) => q.id === question.id);
                this.questions[INDEX] = response.body.question;
                this.questions$.next(this.questions);

                return '';
            }),
        );
    }
}