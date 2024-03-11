import { Injectable } from '@angular/core';
import { Timer } from '@app/classes/timer';

@Injectable({
    providedIn: 'root',
})
export class TimeService {
    private timers: Map<number, Timer> = new Map<number, Timer>();
    private nextId: number = 0;

    createTimerById(callback?: () => void): number {
        const timer = new Timer(callback);
        this.nextId++;
        this.timers.set(this.nextId, timer);
        return this.nextId;
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

    pauseTimerById(timerId: number) {
        this.timers.get(timerId)?.pause();
    }

    resumeTimerById(timerId: number) {
        this.timers.get(timerId)?.resume();
    }
}
