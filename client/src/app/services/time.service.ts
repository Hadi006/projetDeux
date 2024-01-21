import { Injectable } from '@angular/core';
import { Timer } from '@app/interfaces/timer';

@Injectable({
    providedIn: 'root',
})
export class TimeService {
    private readonly tick = 1000;
    private timers: Map<number, Timer> = new Map();
    private nextId = 0;

    startTimer(startValue: number): number {
        const timer: Timer = {
            counter: startValue,
            interval: window.setInterval(() => {
                if (timer.counter > 0) {
                    timer.counter--;
                } else {
                    this.stopTimer(timerId);
                }
            }, this.tick),
        };
        const timerId = this.nextId++;
        this.timers.set(timerId, timer);
        return timerId;
    }

    stopTimer(timerId: number) {
        const timer = this.timers.get(timerId);
        if (timer && timer.interval) {
            clearInterval(timer.interval);
            this.timers.delete(timerId);
        }
    }

    getTime(timerId: number): number | undefined {
        return this.timers.get(timerId)?.counter;
    }
}
