import { TestBed } from '@angular/core/testing';

import { QuestionHandlerService } from './question-handler.service';
import { QUESTIONS_DATA } from '@app/services/game-handler.service';

describe('QuestionHandlerService', () => {
    let service: QuestionHandlerService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(QuestionHandlerService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('currentQuestion should return the current question', () => {
        service.setQuestions(QUESTIONS_DATA);
        expect(service.currentQuestion).toEqual(QUESTIONS_DATA[0]);
    });
});
