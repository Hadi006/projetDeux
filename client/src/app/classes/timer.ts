export class Timer {
    private readonly tick: number = 1000;
    private interval: number | undefined;
    private counter: number = 0;

    constructor(private onTimerEndCallback?: () => void) {}

    get time(): number {
        return this.counter;
    }

    private set time(value: number) {
        this.counter = value;
    }

    start(startValue: number): void {
        if (this.interval) {
            return;
        }

        this.time = startValue;
        this.interval = window.setInterval(() => {
            if (this.counter > 0) {
                this.counter--;
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
