import { TestBed } from '@angular/core/testing';
import { Timer } from '@app/classes/timer';
import { TimeService } from '@app/services/time/time.service';

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

    it('createTimerById should return a number', () => {
        expect(service.createTimerById()).toEqual(jasmine.any(Number));
    });

    it('createTimerById should return a unique number each time', () => {
        const firstId = service.createTimerById();
        const secondId = service.createTimerById();

        expect(firstId).not.toEqual(secondId);
    });

    it('createTimerById should add a timer to the map with the correct id', () => {
        const timerId = service.createTimerById();
        const timer = service['timers'].get(timerId);

        expect(timer).toBeTruthy();
        expect(timer).toBeInstanceOf(Timer);
    });

    it('createTimerById should add a timer with callback to the map with the correct id', () => {
        const timerId = service.createTimerById();
        const timer = service['timers'].get(timerId);

        expect(timer).toBeTruthy();
        expect(timer).toBeInstanceOf(Timer);
    });

    it('startTimerById should start the timer with the correct id', () => {
        const mockTimer = jasmine.createSpyObj('Timer', ['start']);
        spyOn(service, 'createTimerById').and.callFake(() => {
            service['timers'].set(TIMER_ID, mockTimer);
            return TIMER_ID;
        });

        const timerId = service.createTimerById();
        service.startTimerById(timerId, 0);

        expect(mockTimer.start).toHaveBeenCalled();
    });

    it('startTimerById should not start the timer with the incorrect id', () => {
        const mockTimer = jasmine.createSpyObj('Timer', ['start']);
        spyOn(service, 'createTimerById').and.callFake(() => {
            service['timers'].set(TIMER_ID, mockTimer);
            return TIMER_ID;
        });

        const timerId = service.createTimerById();
        service.startTimerById(timerId + 1, 0);

        expect(mockTimer.start).not.toHaveBeenCalled();
    });

    it('stopTimer should stop the timer with the correct id', () => {
        const mockTimer = jasmine.createSpyObj('Timer', ['stop']);
        spyOn(service, 'createTimerById').and.callFake(() => {
            service['timers'].set(TIMER_ID, mockTimer);
            return TIMER_ID;
        });

        const timerId = service.createTimerById();
        service.stopTimerById(timerId);

        expect(mockTimer.stop).toHaveBeenCalled();
    });

    it('stopTimer should not stop the timer with the incorrect id', () => {
        const mockTimer = jasmine.createSpyObj('Timer', ['stop']);
        spyOn(service, 'createTimerById').and.callFake(() => {
            service['timers'].set(TIMER_ID, mockTimer);
            return TIMER_ID;
        });

        const timerId = service.createTimerById();
        service.stopTimerById(timerId + 1);

        expect(mockTimer.stop).not.toHaveBeenCalled();
    });

    it('getTime should return the correct time for the timer with the correct id', () => {
        const mockTimer = jasmine.createSpyObj('Timer', ['time']);
        mockTimer['time'] = TIMEOUT;
        spyOn(service, 'createTimerById').and.callFake(() => {
            service['timers'].set(TIMER_ID, mockTimer);
            return TIMER_ID;
        });

        const timerId = service.createTimerById();
        const time = service.getTimeById(timerId);

        expect(time).toEqual(TIMEOUT);
    });

    it('getTime should return 0 for the timer with the incorrect id', () => {
        const mockTimer = jasmine.createSpyObj('Timer', ['time']);
        mockTimer['time'] = TIMEOUT;
        spyOn(service, 'createTimerById').and.callFake(() => {
            service['timers'].set(TIMER_ID, mockTimer);
            return TIMER_ID;
        });

        const timerId = service.createTimerById();
        const time = service.getTimeById(timerId + 1);

        expect(time).toEqual(0);
    });

    it('setTime should set the correct time for the timer with the correct id', () => {
        const mockTimer = jasmine.createSpyObj('Timer', ['time']);
        mockTimer['time'] = TIMEOUT;
        spyOn(service, 'createTimerById').and.callFake(() => {
            service['timers'].set(TIMER_ID, mockTimer);
            return TIMER_ID;
        });

        const timerId = service.createTimerById();
        service.setTimeById(timerId, 0);

        expect(mockTimer['time']).toEqual(0);
    });

    it('setTime should not set the time for the timer with the incorrect id', () => {
        const mockTimer = jasmine.createSpyObj('Timer', ['time']);
        mockTimer['time'] = TIMEOUT;
        spyOn(service, 'createTimerById').and.callFake(() => {
            service['timers'].set(TIMER_ID, mockTimer);
            return TIMER_ID;
        });

        const timerId = service.createTimerById();
        service.setTimeById(timerId + 1, 0);

        expect(mockTimer['time']).toEqual(TIMEOUT);
    });

    it('pauseTimer should pause the timer with the correct id', () => {
        const mockTimer = jasmine.createSpyObj('Timer', ['pause']);
        spyOn(service, 'createTimerById').and.callFake(() => {
            service['timers'].set(TIMER_ID, mockTimer);
            return TIMER_ID;
        });

        const timerId = service.createTimerById();
        service.pauseTimerById(timerId);

        expect(mockTimer.pause).toHaveBeenCalled();
    });

    it('pauseTimer should not pause the timer with the incorrect id', () => {
        const mockTimer = jasmine.createSpyObj('Timer', ['pause']);
        spyOn(service, 'createTimerById').and.callFake(() => {
            service['timers'].set(TIMER_ID, mockTimer);
            return TIMER_ID;
        });

        const timerId = service.createTimerById();
        service.pauseTimerById(timerId + 1);

        expect(mockTimer.pause).not.toHaveBeenCalled();
    });

    it('resumeTimer should resume the timer with the correct id', () => {
        const mockTimer = jasmine.createSpyObj('Timer', ['resume']);
        spyOn(service, 'createTimerById').and.callFake(() => {
            service['timers'].set(TIMER_ID, mockTimer);
            return TIMER_ID;
        });

        const timerId = service.createTimerById();
        service.resumeTimerById(timerId);

        expect(mockTimer.resume).toHaveBeenCalled();
    });

    it('resumeTimer should not resume the timer with the incorrect id', () => {
        const mockTimer = jasmine.createSpyObj('Timer', ['resume']);
        spyOn(service, 'createTimerById').and.callFake(() => {
            service['timers'].set(TIMER_ID, mockTimer);
            return TIMER_ID;
        });

        const timerId = service.createTimerById();
        service.resumeTimerById(timerId + 1);

        expect(mockTimer.resume).not.toHaveBeenCalled();
    });
});
