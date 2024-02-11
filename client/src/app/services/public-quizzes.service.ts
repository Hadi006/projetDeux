import { HttpResponse, HttpStatusCode } from '@angular/common/http';
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

    fetchVisibleQuizzes() {
        this.http.get<Quiz[]>('quizzes/visible').subscribe((response: HttpResponse<Quiz[]>) => {
            if (!response.body || response.status !== HttpStatusCode.Ok || !Array.isArray(response.body)) {
                return;
            }
            this.quizzes$.next(response.body);
        });
    }
}
