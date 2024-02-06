import { discardPeriodicTasks, fakeAsync, tick } from '@angular/core/testing';
import { Timer } from './timer';

describe('Timer', () => {
    let timerTest: Timer;
    const TIMEOUT = 5;
    const MS_SECOND = 1000;

    describe('without callback', () => {
        beforeEach(() => {
            timerTest = new Timer();
        });

        it('should be created', () => {
            expect(timerTest).toBeTruthy();
        });

        it('startTimer should start an interval', fakeAsync(() => {
            timerTest.start(TIMEOUT);
            const interval = timerTest['interval'];

            expect(interval).toBeTruthy();
            expect(timerTest.time).toEqual(TIMEOUT);
            discardPeriodicTasks();
        }));

        it('startTimer should call setInterval', fakeAsync(() => {
            const spy = spyOn(window, 'setInterval');
            timerTest.start(TIMEOUT);

            expect(spy).toHaveBeenCalled();
            discardPeriodicTasks();
        }));

        it('startTimer should set time to the correct value', fakeAsync(() => {
            timerTest.start(TIMEOUT);

            expect(timerTest.time).toEqual(TIMEOUT);
            discardPeriodicTasks();
        }));

        it('startTimer should set time to 0 if startValue is negative', fakeAsync(() => {
            timerTest.start(-TIMEOUT);

            expect(timerTest.time).toEqual(0);
            discardPeriodicTasks();
        }));

        it('interval should reduce time by 1 every second ', fakeAsync(() => {
            timerTest.start(TIMEOUT);

            tick(MS_SECOND);
            expect(timerTest.time).toEqual(TIMEOUT - 1);

            tick(MS_SECOND);
            expect(timerTest.time).toEqual(TIMEOUT - 2);
            discardPeriodicTasks();
        }));

        it('interval should stop after TIMEOUT seconds ', fakeAsync(() => {
            timerTest.start(TIMEOUT);
            tick((TIMEOUT + 2) * MS_SECOND);

            expect(timerTest.time).toEqual(0);
            discardPeriodicTasks();
        }));

        it('startTimer should not start a new interval if one exists', fakeAsync(() => {
            timerTest.start(TIMEOUT);
            const spy = spyOn(window, 'setInterval');
            timerTest.start(TIMEOUT);

            expect(spy).not.toHaveBeenCalled();
            discardPeriodicTasks();
        }));

        it('startTimer should call stopTimer at the end of timer', fakeAsync(() => {
            const spy = spyOn(timerTest, 'stop').and.callThrough();
            timerTest.start(TIMEOUT);
            tick((TIMEOUT + 1) * MS_SECOND);

            expect(spy).toHaveBeenCalled();
            discardPeriodicTasks();
        }));

        it('stopTimer should call clearInterval and setInterval to undefined', fakeAsync(() => {
            const spy = spyOn(window, 'clearInterval');
            timerTest.stop();

            expect(spy).toHaveBeenCalled();
            expect(timerTest['interval']).toBeFalsy();
            discardPeriodicTasks();
        }));
    });

    describe('with callback', () => {
        beforeEach(fakeAsync(() => {
            const callbackSpy = jasmine.createSpy('callbackSpy');
            timerTest = new Timer(callbackSpy);
            discardPeriodicTasks();
        }));

        it('should be created', fakeAsync(() => {
            expect(timerTest).toBeTruthy();
            discardPeriodicTasks();
        }));

        it('startTimer should start an interval', fakeAsync(() => {
            timerTest.start(TIMEOUT);
            const interval = timerTest['interval'];

            expect(interval).toBeTruthy();
            expect(timerTest.time).toEqual(TIMEOUT);
            discardPeriodicTasks();
        }));

        it('startTimer should call setInterval', fakeAsync(() => {
            const spy = spyOn(window, 'setInterval');
            timerTest.start(TIMEOUT);

            expect(spy).toHaveBeenCalled();
            discardPeriodicTasks();
        }));

        it('interval should reduce time by 1 every second ', fakeAsync(() => {
            timerTest.start(TIMEOUT);
            tick(MS_SECOND);

            expect(timerTest.time).toEqual(TIMEOUT - 1);
            tick(MS_SECOND);

            expect(timerTest.time).toEqual(TIMEOUT - 2);
            discardPeriodicTasks();
        }));

        it('interval should stop after TIMEOUT seconds ', fakeAsync(() => {
            timerTest.start(TIMEOUT);
            tick((TIMEOUT + 2) * MS_SECOND);

            expect(timerTest.time).toEqual(0);
            discardPeriodicTasks();
        }));

        it('startTimer should not start a new interval if one exists', fakeAsync(() => {
            timerTest.start(TIMEOUT);
            const spy = spyOn(window, 'setInterval');
            timerTest.start(TIMEOUT);

            expect(spy).not.toHaveBeenCalled();
            discardPeriodicTasks();
        }));

        it('startTimer should call stopTimer at the end of timer', fakeAsync(() => {
            const spy = spyOn(timerTest, 'stop').and.callThrough();
            timerTest.start(TIMEOUT);
            tick((TIMEOUT + 1) * MS_SECOND);

            expect(spy).toHaveBeenCalled();
            discardPeriodicTasks();
        }));

        it('startTimer should call callback at the end of timer', fakeAsync(() => {
            timerTest.start(TIMEOUT);
            tick((TIMEOUT + 1) * MS_SECOND);

            expect(timerTest['onTimerEndCallback']).toHaveBeenCalled();
            discardPeriodicTasks();
        }));

        it('stopTimer should call clearInterval and setInterval to undefined', fakeAsync(() => {
            const spy = spyOn(window, 'clearInterval');
            timerTest.stop();

            expect(spy).toHaveBeenCalled();
            expect(timerTest['interval']).toBeFalsy();
            discardPeriodicTasks();
        }));
    });
});
