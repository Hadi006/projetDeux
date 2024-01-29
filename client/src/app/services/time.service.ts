import { Injectable } from '@angular/core';
import { Timer } from '@app/classes/timer';

@Injectable({
    providedIn: 'root',
})
export class TimeService {
<<<<<<< HEAD
    private timers: Map<number, Timer> = new Map<number, Timer>();
    private nextId: number = 0;
=======
    // TODO : Permettre plus qu'une minuterie à la fois
    private interval: number | undefined;
    private readonly tick = 1000;
    private onTimerEndCallback: (() => void) | undefined;
>>>>>>> f2ba0ca (Time service now accepts a callback function for when it ends)

    createTimer(callback?: () => void): number {
        const timerId = this.nextId++;
        const timer = new Timer(callback);
        this.timers.set(timerId, timer);
        return timerId;
    }

<<<<<<< HEAD
    startTimer(timerId: number, startValue: number) {
        const timer = this.timers.get(timerId);
        timer?.start(startValue);
=======
    startTimer(startValue: number, onTimerEnd?: () => void) {
        if (this.interval) return;
        this.time = startValue;
        this.onTimerEndCallback = onTimerEnd;
        this.interval = window.setInterval(() => {
            if (this.time > 0) {
                this.time--;
            } else {
                this.stopTimer();
                this.onTimerEndCallback?.();
            }
        }, this.tick);
>>>>>>> f2ba0ca (Time service now accepts a callback function for when it ends)
    }

    stopTimer(timerId: number) {
        const timer = this.timers.get(timerId);
        timer?.stop();
    }

    getTime(timerId: number): number {
        const timer = this.timers.get(timerId);
        return timer?.time ?? 0;
    }

    setTime(timerId: number, time: number) {
        const timer = this.timers.get(timerId);
        if (timer) {
            timer.time = time;
        }
    }
}
