export class Timer {
    time: number = 0;

    private readonly tick: number = 1000;
    private interval: number | undefined;

    constructor(private onTimerEndCallback?: () => void) {}

    start(startValue: number): void {
        if (this.interval) {
            return;
        }

        this.time = startValue;
        this.interval = window.setInterval(() => {
            if (this.time > 0) {
                this.time--;
            } else {
                this.stop();
                this.onTimerEndCallback?.();
            }
        }, this.tick);
    }

    stop(): void {
        clearInterval(this.interval);
        this.interval = undefined;
    }
}
