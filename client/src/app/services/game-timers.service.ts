import { Injectable } from '@angular/core';
import { TimeService } from '@app/services/time.service';

@Injectable({
    providedIn: 'root',
})
export class GameTimersService {
    private questionTimerId: number;
    private answerTimerId: number;

    constructor(private timeService: TimeService) {}

    get questionTime(): number {
        return this.timeService.getTime(this.questionTimerId);
    }

    get answerTime(): number {
        return this.timeService.getTime(this.answerTimerId);
    }

    createQuestionTimer(questionTimerCallback: () => void): void {
        this.questionTimerId = this.timeService.createTimer(questionTimerCallback);
    }

    createAnswerTimer(answerTimerCallback: () => void): void {
        this.answerTimerId = this.timeService.createTimer(answerTimerCallback);
    }

    startQuestionTimer(time: number): void {
        this.timeService.startTimer(this.questionTimerId, time);
    }

    startAnswerTimer(time: number): void {
        this.timeService.startTimer(this.answerTimerId, time);
    }

    stopQuestionTimer(): void {
        this.timeService.stopTimer(this.questionTimerId);
    }

    stopAnswerTimer(): void {
        this.timeService.stopTimer(this.answerTimerId);
    }

    setQuestionTime(time: number): void {
        this.timeService.setTime(this.questionTimerId, time);
    }

    setAnswerTime(time: number): void {
        this.timeService.setTime(this.answerTimerId, time);
    }
}
