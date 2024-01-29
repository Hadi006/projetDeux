import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class PlayerHandlerService {
    private answerConfirmedNotifierSubjects: Subject<number>[] = [];

    get answerConfirmedNotifiers(): Subject<number>[] {
        return this.answerConfirmedNotifierSubjects;
    }

    createAnswerConfirmedNotifier(): Subject<number> {
        const subject: Subject<number> = new Subject<number>();
        this.answerConfirmedNotifierSubjects.push(subject);
        return subject;
    }
}
