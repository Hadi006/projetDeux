import { TIMER_TICK_RATE } from '@common/constant';

export class Timer {
    time: number;
    private interval: number | undefined;
    private tickRate: number;
    private callback: () => void;

    constructor(tickRate: number = TIMER_TICK_RATE) {
        this.time = 0;
        this.interval = undefined;
        this.tickRate = tickRate;
    }

    start(
        time: number,
        callback: () => void = () => {
            return;
        },
    ) {
        if (this.interval) {
            return;
        }

        this.time = time > 0 ? time : 0;
        this.callback = callback;
        this.resume();
    }

    stop() {
        if (!this.interval) {
            return;
        }

        clearInterval(this.interval);
        this.time = 0;
        this.interval = undefined;
    }

    pause() {
        clearInterval(this.interval);
        this.interval = undefined;
    }

    resume() {
        if (this.interval) {
            return;
        }

        this.interval = window.setInterval(() => {
            if (this.time > 0) {
                this.time--;
            } else {
                this.stop();
                this.callback();
            }
        }, this.tickRate);
    }
}
