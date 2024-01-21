import { Injectable } from '@angular/core';
import { Timer } from '@app/interfaces/timer';

@Injectable({
    providedIn: 'root',
})
export class TimeService {
    private readonly tick = 1000;
    private timers = new Map<number, Timer>();
    private nextId = 0;

    startTimer(startValue: number, onTimerEnd?: () => void): number {
        const timerId = this.nextId++;
        const interval = window.setInterval(() => {
            const timer = this.timers.get(timerId);
            if (timer) {
                if (timer.counter > 0) {
                    timer.counter--;
                } else {
                    this.stopTimer(timerId);
                    timer.onTimerEndCallback?.();
                }
            }
        }, this.tick);

        const newTimer: Timer = {
            interval,
            counter: startValue,
            onTimerEndCallback: onTimerEnd,
        };

        this.timers.set(timerId, newTimer);
        return timerId;
    }

    stopTimer(timerId: number): void {
        const timer = this.timers.get(timerId);
        if (timer) {
            clearInterval(timer.interval);
            this.timers.delete(timerId);
        }
    }

    getTime(timerId: number): number {
        const timer = this.timers.get(timerId);
        return timer ? timer.counter : 0;
    }
}
