import { Injectable } from '@angular/core';
import { Timer } from '@app/classes/timer';
import { BehaviorSubject } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class TimeService {
    counterToggled: boolean = false;
    test: number = 10;
    private timers: Map<number, Timer> = new Map<number, Timer>();
    private nextId: number = 0;
    private commonValueSubject = new BehaviorSubject<number>(0);
    commonValue$ = this.commonValueSubject.asObservable();

    createTimerById(): number {
        const timer = new Timer();
        this.nextId++;
        this.timers.set(this.nextId, timer);
        return this.nextId;
    }
    incrementCommonValue(): void {
        const currentValue = this.commonValueSubject.getValue();
        const newValue = currentValue + 1; // Increment the value by 1
        this.commonValueSubject.next(newValue);
    }
    startTimerById(timerId: number, startValue: number, callback?: () => void) {
        this.timers.get(timerId)?.start(startValue, callback);
    }

    stopTimerById(timerId: number) {
        this.timers.get(timerId)?.stop();
    }

    getTimeById(timerId: number): number {
        return this.timers.get(timerId)?.time ?? 0;
    }

    setTimeById(timerId: number, time: number) {
        const timer = this.timers.get(timerId);
        if (timer) {
            timer.time = time;
        }
    }
    testFunction(): void {
        const currentValue = this.commonValueSubject.getValue(); // Get the current value
        const newValue = currentValue + this.test; // Add 10 to the current value
        this.commonValueSubject.next(newValue); // Emit the new value
    }
    pauseTimerById(timerId: number) {
        this.counterToggled = true;
        console.log(this.counterToggled);
        this.timers.get(timerId)?.pause();
    }

    resumeTimerById(timerId: number) {
        this.timers.get(timerId)?.resume();
    }
}
