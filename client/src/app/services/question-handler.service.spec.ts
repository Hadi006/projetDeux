import { TestBed } from '@angular/core/testing';

import { QuestionHandlerService, GOOD_ANSWER_MULTIPLIER } from '@app/services/question-handler.service';
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

    it('currentQuestion getter should return the current question', () => {
        service.questionsData = QUESTIONS_DATA;
        expect(service.currentQuestion).toEqual(QUESTIONS_DATA[0]);
    });

    it('questionsData setter should set the questionsData and nQuestions', () => {
        service.questionsData = QUESTIONS_DATA;
        expect(service.currentQuestion).toEqual(QUESTIONS_DATA[0]);
        expect(service.nQuestions).toEqual(QUESTIONS_DATA.length);
    });

    it('nextQuestion should load the next question', () => {
        service.questionsData = QUESTIONS_DATA;
        service.nextQuestion();
        expect(service.currentQuestion).toEqual(QUESTIONS_DATA[1]);
    });

    it('calculateScore should return the correct value for a correct answer', () => {
        service.questionsData = QUESTIONS_DATA;
        const answer = [false, true, false, false];
        expect(service.calculateScore(answer)).toEqual(QUESTIONS_DATA[0].points * GOOD_ANSWER_MULTIPLIER);
    });

    it('calculateScore should return 0 for an incorrect answer', () => {
        service.questionsData = QUESTIONS_DATA;
        const answer = [true, false, false, false];
        expect(service.calculateScore(answer)).toEqual(0);
    });

    it('calculateScore should return the correct value for an open ended question', () => {
        service.questionsData = QUESTIONS_DATA;
        service.nextQuestion();
        expect(service.calculateScore([])).toEqual(QUESTIONS_DATA[1].points * GOOD_ANSWER_MULTIPLIER);
    });
});
