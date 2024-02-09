export class Timer {
    time: number = 0;

    private readonly tick: number = 1000;
    private interval: number | undefined;

    constructor(
        private onTimerEndCallback: () => void = () => {
            return;
        },
    ) {}

    start(startValue: number): void {
        if (this.interval) {
            return;
        }

        this.time = startValue < 0 ? 0 : startValue;
        this.interval = window.setInterval(() => {
            if (this.time > 0) {
                this.time--;
            } else {
                this.stop();
                this.onTimerEndCallback();
            }
        }, this.tick);
    }

    stop(): void {
        if (!this.interval) {
            return;
        }

        clearInterval(this.interval);
        this.interval = undefined;
    }
}
