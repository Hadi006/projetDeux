import { Component, Input, OnInit } from '@angular/core';
import { TimeService } from '@app/services/time.service';

@Component({
    selector: 'app-game-count-down',
    templateUrl: './game-count-down.component.html',
    styleUrls: ['./game-count-down.component.scss'],
})
export class GameCountDownComponent implements OnInit {
    @Input() gameName: string;
    @Input() countdownTime: number;

    private timerId: number;

    constructor(private timeService: TimeService) {
        this.timerId = this.timeService.createTimerById();
    }

    get time() {
        return this.timeService.getTimeById(this.timerId);
    }

    ngOnInit(): void {
        this.timeService.startTimerById(this.timerId, this.countdownTime);
    }
}
