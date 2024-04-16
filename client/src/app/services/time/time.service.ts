import { Injectable } from '@angular/core';
import { Timer } from '@app/classes/timer';
// import { Howl } from 'howler';

@Injectable({
    providedIn: 'root',
})
export class TimeService {
    counterToggled: boolean = false;
    audio = new Audio();
    private timers: Map<number, Timer> = new Map<number, Timer>();
    private nextId: number = 0;

    constructor() {
        this.audio.src = './assets/sound.mp3';
    }

    createTimerById(decrement: number = 1): number {
        const timer = new Timer(decrement);
        this.nextId++;
        this.timers.set(this.nextId, timer);
        return this.nextId;
    }

    startTimerById(timerId: number, startValue: number, callback?: () => void) {
        this.timers.get(timerId)?.start(startValue, callback);
    }

    stopTimerById(timerId: number) {
        this.timers.get(timerId)?.stop();
    }

    getTimeById(timerId: number): number {
        return this.timers.get(timerId)?.time ?? 0;
    }

    setTimeById(timerId: number, time: number) {
        const timer = this.timers.get(timerId);
        if (timer) {
            timer.time = time;
        }
    }
    toggleTimerById(timerId: number) {
        if (this.counterToggled) {
            return this.resumeTimerById(timerId);
        }
        return this.pauseTimerById(timerId);
    }

    pauseTimerById(timerId: number) {
        this.counterToggled = true;
        this.timers.get(timerId)?.pause();
    }

    resumeTimerById(timerId: number) {
        this.counterToggled = false;
        this.timers.get(timerId)?.resume();
    }
    startPanicMode(): void {
        if (this.audio.paused) {
            this.audio.play();
        }
    }
    stopPanicMode(): void {
        this.audio.pause();
        this.audio.currentTime = 0;
    }
}
