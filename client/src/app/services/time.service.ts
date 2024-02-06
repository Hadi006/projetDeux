import { Injectable } from '@angular/core';
import { Timer } from '@app/classes/timer';

@Injectable({
    providedIn: 'root',
})
export class TimeService {
    private timers: Map<number, Timer> = new Map<number, Timer>();
    private nextId: number = 0;

    createTimerById(callback?: () => void): number {
        const timerId = this.nextId++;
        const timer = new Timer(callback);
        this.timers.set(timerId, timer);
        return timerId;
    }

    startTimerById(timerId: number, startValue: number) {
        const timer = this.timers.get(timerId);
        timer?.start(startValue);
    }

    stopTimerById(timerId: number) {
        const timer = this.timers.get(timerId);
        timer?.stop();
    }

    getTimeById(timerId: number): number {
        const timer = this.timers.get(timerId);
        return timer?.time ?? 0;
    }

    setTimeById(timerId: number, time: number) {
        const timer = this.timers.get(timerId);
        if (timer) {
            timer.time = time;
        }
    }
}
