import { TestBed } from '@angular/core/testing';

import { Timer } from '@app/classes/timer';
import { TimeService } from '@app/services/time.service';

describe('TimeService', () => {
    let service: TimeService;
    const TIMER_ID = 0;
    const TIMEOUT = 5;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(TimeService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('createTimer should return a number', () => {
        expect(service.createTimer()).toEqual(jasmine.any(Number));
    });

    it('createTimer should return a unique number each time', () => {
        const firstId = service.createTimer();
        const secondId = service.createTimer();

        expect(firstId).not.toEqual(secondId);
    });

    it('createTimer should add a timer to the map with the correct id', () => {
        const timerId = service.createTimer();
        const timer = service['timers'].get(timerId);

        expect(timer).toBeTruthy();
        expect(timer).toBeInstanceOf(Timer);
    });

    it('createTimer should add a timer with callback to the map with the correct id', () => {
        const callbackSpy = jasmine.createSpy('callback');
        const timerId = service.createTimer(callbackSpy);
        const timer = service['timers'].get(timerId);

        expect(timer).toBeTruthy();
        expect(timer).toBeInstanceOf(Timer);
    });

    it('startTimer should start the timer with the correct id', () => {
        const mockTimer = jasmine.createSpyObj('Timer', ['start']);
        spyOn(service, 'createTimer').and.callFake(() => {
            service['timers'].set(TIMER_ID, mockTimer);
            return TIMER_ID;
        });

        const timerId = service.createTimer();
        service.startTimer(timerId, 0);

        expect(mockTimer.start).toHaveBeenCalled();
    });

    it('startTimer should not start the timer with the incorrect id', () => {
        const mockTimer = jasmine.createSpyObj('Timer', ['start']);
        spyOn(service, 'createTimer').and.callFake(() => {
            service['timers'].set(TIMER_ID, mockTimer);
            return TIMER_ID;
        });

        const timerId = service.createTimer();
        service.startTimer(timerId + 1, 0);

        expect(mockTimer.start).not.toHaveBeenCalled();
    });

    it('stopTimer should stop the timer with the correct id', () => {
        const mockTimer = jasmine.createSpyObj('Timer', ['stop']);
        spyOn(service, 'createTimer').and.callFake(() => {
            service['timers'].set(TIMER_ID, mockTimer);
            return TIMER_ID;
        });

        const timerId = service.createTimer();
        service.stopTimer(timerId);

        expect(mockTimer.stop).toHaveBeenCalled();
    });

    it('stopTimer should not stop the timer with the incorrect id', () => {
        const mockTimer = jasmine.createSpyObj('Timer', ['stop']);
        spyOn(service, 'createTimer').and.callFake(() => {
            service['timers'].set(TIMER_ID, mockTimer);
            return TIMER_ID;
        });

        const timerId = service.createTimer();
        service.stopTimer(timerId + 1);

        expect(mockTimer.stop).not.toHaveBeenCalled();
    });

    it('getTime should return the correct time for the timer with the correct id', () => {
        const mockTimer = jasmine.createSpyObj('Timer', ['time']);
        mockTimer['time'] = TIMEOUT;
        spyOn(service, 'createTimer').and.callFake(() => {
            service['timers'].set(TIMER_ID, mockTimer);
            return TIMER_ID;
        });

        const timerId = service.createTimer();
        const time = service.getTime(timerId);

        expect(time).toEqual(TIMEOUT);
    });

    it('getTime should return 0 for the timer with the incorrect id', () => {
        const mockTimer = jasmine.createSpyObj('Timer', ['time']);
        mockTimer['time'] = TIMEOUT;
        spyOn(service, 'createTimer').and.callFake(() => {
            service['timers'].set(TIMER_ID, mockTimer);
            return TIMER_ID;
        });

        const timerId = service.createTimer();
        const time = service.getTime(timerId + 1);

        expect(time).toEqual(0);
    });

    it('setTime should set the correct time for the timer with the correct id', () => {
        const mockTimer = jasmine.createSpyObj('Timer', ['time']);
        mockTimer['time'] = TIMEOUT;
        spyOn(service, 'createTimer').and.callFake(() => {
            service['timers'].set(TIMER_ID, mockTimer);
            return TIMER_ID;
        });

        const timerId = service.createTimer();
        service.setTime(timerId, 0);

        expect(mockTimer['time']).toEqual(0);
    });

    it('setTime should not set the time for the timer with the incorrect id', () => {
        const mockTimer = jasmine.createSpyObj('Timer', ['time']);
        mockTimer['time'] = TIMEOUT;
        spyOn(service, 'createTimer').and.callFake(() => {
            service['timers'].set(TIMER_ID, mockTimer);
            return TIMER_ID;
        });

        const timerId = service.createTimer();
        service.setTime(timerId + 1, 0);

        expect(mockTimer['time']).toEqual(TIMEOUT);
    });
});
