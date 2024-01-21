export interface Timer {
    interval: number | undefined;
    counter: number;
    onTimerEndCallback?: () => void;
}
