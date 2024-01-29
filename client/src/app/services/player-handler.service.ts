import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class PlayerHandlerService {
    private answerConfirmedNotifierSubjects: Subject<void>[] = [];

    get answerConfirmedNotifiers() {
        return this.answerConfirmedNotifierSubjects;
    }
}
