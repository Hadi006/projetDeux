import { HttpStatusCode } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { CommunicationService } from '@app/services/communication/communication.service';
import { BLANK_QUESTION } from '@common/constant';
import { Question } from '@common/quiz';
import { ValidationResult } from '@common/validation-result';
import { BehaviorSubject, Observable, map } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class QuestionBankService {
    readonly questions$: BehaviorSubject<Question[]>;
    private questions: Question[];

    constructor(private http: CommunicationService) {
        this.questions = [];
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
        return QUESTION || BLANK_QUESTION;
    }

    addQuestion(question: Question): Observable<string> {
        return this.http.post<ValidationResult<Question>>('questions', { question }).pipe(
            map((response) => {
                if (!response.body) {
                    return 'Server error';
                }

                if (response.body.error) {
                    return response.body.error;
                }

                this.questions.push(response.body.data as Question);
                this.questions$.next(this.questions);

                return '';
            }),
        );
    }

    updateQuestion(question: Question): Observable<string> {
        return this.http.patch<ValidationResult<Question>>(`questions/${question.text}`, { question }).pipe(
            map((response) => {
                if (!response.body || !response.body.data || response.body.error === undefined) {
                    return 'Server error';
                }

                if (response.body.error) {
                    return response.body.error;
                }

                const INDEX: number = this.questions.findIndex((newQuestion: Question) => newQuestion.text === question.text);
                this.questions[INDEX] = response.body.data;
                this.questions$.next(this.questions);

                return '';
            }),
        );
    }

    deleteQuestion(index: number) {
        const question: Question | undefined = this.questions[index];
        if (!question) {
            return;
        }

        this.http.delete<string>(`questions/${question.text}`).subscribe((response) => {
            if (response.status === HttpStatusCode.Ok) {
                this.questions.splice(index, 1);
                this.questions$.next(this.questions);
            }
        });
    }
}
