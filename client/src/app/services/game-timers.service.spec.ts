import { TestBed } from '@angular/core/testing';

import { GameTimersService } from './game-timers.service';
import { TimeService } from './time.service';

describe('GameTimersService', () => {
    const TIME_OUT = 10;
    const QUESTION_ID = 0;
    const ANSWER_ID = 1;

    let service: GameTimersService;
    let timeServiceSpy: jasmine.SpyObj<TimeService>;

    beforeEach(() => {
        timeServiceSpy = jasmine.createSpyObj('TimeService', ['createTimer', 'startTimer', 'stopTimer', 'getTime', 'setTime']);
    });

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [{ provide: TimeService, useValue: timeServiceSpy }],
        });
        service = TestBed.inject(GameTimersService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('createQuestionTimer should call createTimer with the correct callback and assign an id to questionTimerId', () => {
        const callback = () => {
            return;
        };
        timeServiceSpy.createTimer.and.returnValue(QUESTION_ID);
        service.createQuestionTimer(callback);

        expect(timeServiceSpy.createTimer).toHaveBeenCalledWith(callback);
        expect(service['questionTimerId']).toEqual(QUESTION_ID);
    });

    it('createAnswerTimer should call createTimer with the correct callback and assign an id to answerTimerId', () => {
        const callback = () => {
            return;
        };
        timeServiceSpy.createTimer.and.returnValue(ANSWER_ID);
        service.createAnswerTimer(callback);

        expect(timeServiceSpy.createTimer).toHaveBeenCalledWith(callback);
        expect(service['answerTimerId']).toEqual(ANSWER_ID);
    });

    it('startQuestionTimer should call startTimer with the correct id and time', () => {
        service['questionTimerId'] = QUESTION_ID;
        service.startQuestionTimer(TIME_OUT);

        expect(timeServiceSpy.startTimer).toHaveBeenCalledWith(QUESTION_ID, TIME_OUT);
    });

    it('startAnswerTimer should call startTimer with the correct id and time', () => {
        service['answerTimerId'] = ANSWER_ID;
        service.startAnswerTimer(TIME_OUT);

        expect(timeServiceSpy.startTimer).toHaveBeenCalledWith(ANSWER_ID, TIME_OUT);
    });

    it('stopQuestionTimer should call stopTimer with the correct id', () => {
        service['questionTimerId'] = QUESTION_ID;
        service.stopQuestionTimer();

        expect(timeServiceSpy.stopTimer).toHaveBeenCalledWith(QUESTION_ID);
    });

    it('stopAnswerTimer should call stopTimer with the correct id', () => {
        service['answerTimerId'] = ANSWER_ID;
        service.stopAnswerTimer();

        expect(timeServiceSpy.stopTimer).toHaveBeenCalledWith(ANSWER_ID);
    });

    it('getQuestionTime should call getTime with the correct id', () => {
        service['questionTimerId'] = QUESTION_ID;
        service.getQuestionTime();

        expect(timeServiceSpy.getTime).toHaveBeenCalledWith(QUESTION_ID);
    });

    it('getAnswerTime should call getTime with the correct id', () => {
        service['answerTimerId'] = ANSWER_ID;
        service.getAnswerTime();

        expect(timeServiceSpy.getTime).toHaveBeenCalledWith(ANSWER_ID);
    });
});
