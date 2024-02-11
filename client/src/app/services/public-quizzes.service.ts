import { Injectable } from '@angular/core';
import { CommunicationService } from '@app/services/communication.service';
import { Quiz } from '@common/quiz';
import { Subject } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class PublicQuizzesService {
    readonly quizzes$: Subject<Quiz[]>;

    constructor(private http: CommunicationService) {}
}
