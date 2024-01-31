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

    it('nextQuestion should notify subscribers with the next question', () => {
        spyOn(service.questionSubjects, 'next').and.callThrough();
        service.setQuestions(QUESTIONS_DATA);
        service.nextQuestion();

        expect(service.questionSubjects.next).toHaveBeenCalledWith(QUESTIONS_DATA[0]);
    });

    it('nextQuestion should increment the current question index', () => {
        service.setQuestions(QUESTIONS_DATA);
        service.nextQuestion();

        expect(service.currentQuestion).toEqual(QUESTIONS_DATA[1]);
    });

    it('calculateScore should return 0 if currentQuestion is undefined', () => {
        const isChecked = [false, true, false, false];
        spyOnProperty(service, 'currentQuestion', 'get').and.returnValue(undefined);

        expect(service.calculateScore(isChecked)).toEqual(0);
    });
});
