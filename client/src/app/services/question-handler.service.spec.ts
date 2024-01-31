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

    it('setQuestions should set the questionData and the number of questions', () => {
        service.setQuestions(QUESTIONS_DATA);
        QUESTIONS_DATA.forEach((questionData) => {
            expect(service.currentQuestion).toEqual(questionData);
            service.nextQuestion();
        });

        expect(service.nQuestions).toEqual(QUESTIONS_DATA.length);
    });
});
