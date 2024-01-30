import { TestBed } from '@angular/core/testing';

import { GameTimersService } from './game-timers.service';
import { TimeService } from './time.service';

describe('GameTimersService', () => {
    const TIME_OUT = 10;
    const TIMER_IDS = [0, 1];
    const QUESTION_ID_INDEX = 0;
    const ANSWER_ID_INDEX = 1;

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
        timeServiceSpy.createTimer.and.returnValue(0);
        service.createQuestionTimer(callback);

        expect(timeServiceSpy.createTimer).toHaveBeenCalledWith(callback);
        expect(service['questionTimerId']).toEqual(0);
    });

    it('createAnswerTimer should call createTimer with the correct callback and assign an id to answerTimerId', () => {
        const callback = () => {
            return;
        };
        timeServiceSpy.createTimer.and.returnValue(1);
        service.createAnswerTimer(callback);

        expect(timeServiceSpy.createTimer).toHaveBeenCalledWith(callback);
        expect(service['answerTimerId']).toEqual(1);
    });

    it('startQuestionTimer should call startTimer with the correct id and time', () => {
        service['questionTimerId'] = TIMER_IDS[QUESTION_ID_INDEX];
        service.startQuestionTimer(TIME_OUT);

        expect(timeServiceSpy.startTimer).toHaveBeenCalledWith(TIMER_IDS[QUESTION_ID_INDEX], TIME_OUT);
    });
});
