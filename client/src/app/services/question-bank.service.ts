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
}