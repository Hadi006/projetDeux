import { TestBed } from '@angular/core/testing';

import { GameTimersService } from './game-timers.service';
import { TimeService } from './time.service';

describe('GameTimersService', () => {
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
});
