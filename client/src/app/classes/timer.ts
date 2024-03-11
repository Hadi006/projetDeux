import { TIMER_TICK_RATE } from '@common/constant';

export class Timer {
    time: number;
    private interval: number | undefined;
    private tickRate: number;
    private callback: () => void;

    constructor(
        callback: () => void = () => {
            return;
        },
        tickRate: number = TIMER_TICK_RATE,
    ) {
        this.time = 0;
        this.interval = undefined;
        this.tickRate = tickRate;
        this.callback = callback;
    }

    start(time: number, callback?: () => void) {
        if (this.interval) {
            return;
        }

        this.time = time > 0 ? time : 0;
        this.callback = callback || this.callback;
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
    }

    resume() {
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

