import { Injectable } from '@angular/core';
import { QuestionHandlerService } from './question-handler.service';

@Injectable({
    providedIn: 'root',
})
export class ScoreService {
    constructor(private questionHandlerService: QuestionHandlerService) {}
}
