import { Input } from '@angular/core';
import { Component } from '@angular/core';
import { TimeService } from '@app/services/time.service';

@Component({
    selector: 'app-game-count-down',
    templateUrl: './game-count-down.component.html',
    styleUrls: ['./game-count-down.component.scss'],
})
export class GameCountDownComponent {
    countDownTime: number = 5;

    @Input() gameName: string;

    constructor(private timeService: TimeService) {}

    get time() {
        return this.timeService.time;
    }

    ngOnInit(): void {
        this.timeService.startTimer(this.countDownTime);
    }
}
