import { HttpStatusCode } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { CommunicationService } from '@app/services/communication.service';
import { Observable, map } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class AnswerValidatorService {
    constructor(private communicationService: CommunicationService) {}

    validateAnswer(text: string, answer: boolean[]): Observable<boolean> {
        return this.communicationService.post<boolean>('questions/validate-answer', { answer, text}).pipe(
            map((response) => {
                if (response.status !== HttpStatusCode.Ok) {
                    return false;
                }

                return response.body || false;
            }),
        );
    }
}
