import { Injectable } from '@angular/core';
import { CommunicationService } from '@app/services/communication.service';
import { Observable, map } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class AnswerValidatorService {
    constructor(private communicationService: CommunicationService) {}

    validateAnswer(questionId: string, answer: boolean[]): Observable<boolean> {
        return this.communicationService.post<boolean>(`/api/quiz/${questionId}/answer`, answer).pipe(
            map((response) => {
                return response.body || false;
            }),
        );
    }
}
