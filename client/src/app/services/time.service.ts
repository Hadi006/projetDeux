import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root',
})
export class TimeService {
    // TODO : Permettre plus qu'une minuterie à la fois
    private interval: number | undefined;
    private readonly tick = 1000;
    private onTimerEndCallback: (() => void) | undefined;

    private counter = 0;
    get time() {
        return this.counter;
    }
    private set time(newTime: number) {
        this.counter = newTime;
    }

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
    }

    stopTimer() {
        clearInterval(this.interval);
        this.interval = undefined;
    }
}
