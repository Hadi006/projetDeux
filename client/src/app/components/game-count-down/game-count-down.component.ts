import { Component, EventEmitter, Input, Output } from '@angular/core';
import { TimeService } from '@app/services/time/time.service';
import { START_GAME_COUNTDOWN } from '@common/constant';

@Component({
    selector: 'app-game-count-down',
    templateUrl: './game-count-down.component.html',
    styleUrls: ['./game-count-down.component.scss'],
})
export class GameCountDownComponent {
    @Input() gameName: string;
    @Output() countdownEnded = new EventEmitter<void>();

    private timerId: number;

    constructor(private timeService: TimeService) {
        this.timerId = this.timeService.createTimerById();
        this.timeService.startTimerById(this.timerId, START_GAME_COUNTDOWN, this.stopCountDown.bind(this));
    }

    getTime() {
        return this.timeService.getTimeById(this.timerId);
    }

    private stopCountDown() {
        this.countdownEnded.emit();
    }
}
