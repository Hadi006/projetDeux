import { TestBed } from '@angular/core/testing';

import { ScoreService, GOOD_ANSWER_MULTIPLIER } from '@app/services/score.service';
import { QuestionHandlerService } from '@app/services/question-handler.service';
import { QUESTIONS_DATA } from '@app/services/game-handler.service';

describe('ScoreService', () => {
    let service: ScoreService;
    let questionHandlerServiceSpy: jasmine.SpyObj<QuestionHandlerService>;

    beforeEach(() => {
        questionHandlerServiceSpy = jasmine.createSpyObj<QuestionHandlerService>('QuestionHandlerService', ['currentQuestion']);
        Object.defineProperty(questionHandlerServiceSpy, 'currentQuestion', {
            get: () => {
                return undefined;
            },
            configurable: true,
        });
    });

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [{ provide: QuestionHandlerService, useValue: questionHandlerServiceSpy }],
        });
        service = TestBed.inject(ScoreService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('calculateScore should return 0 if there is no current question', () => {
        spyOnProperty(questionHandlerServiceSpy, 'currentQuestion', 'get').and.returnValue(undefined);
        expect(service.calculateScore([])).toEqual(0);
    });

    it('calculateScore should return the correct value for a correct answer', () => {
        spyOnProperty(questionHandlerServiceSpy, 'currentQuestion', 'get').and.returnValue(QUESTIONS_DATA[0]);
        const answer = [false, true, false, false];
        expect(service.calculateScore(answer)).toEqual(QUESTIONS_DATA[0].points * GOOD_ANSWER_MULTIPLIER);
    });

    it('calculateScore should return 0 for an incorrect answer', () => {
        spyOnProperty(questionHandlerServiceSpy, 'currentQuestion', 'get').and.returnValue(QUESTIONS_DATA[0]);
        const answer = [true, false, false, false];
        expect(service.calculateScore(answer)).toEqual(0);
    });

    it('calculateScore should return the correct value for an open ended question', () => {
        spyOnProperty(questionHandlerServiceSpy, 'currentQuestion', 'get').and.returnValue(QUESTIONS_DATA[1]);
        expect(service.calculateScore([])).toEqual(QUESTIONS_DATA[1].points * GOOD_ANSWER_MULTIPLIER);
    });
});
