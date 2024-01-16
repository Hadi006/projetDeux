import { Component, OnInit, Input } from '@angular/core';
import { TimeService } from '@app/services/time.service';

const COUNTDOWN_TIME = 5;

@Component({
    selector: 'app-game-count-down',
    templateUrl: './game-count-down.component.html',
    styleUrls: ['./game-count-down.component.scss'],
})
export class GameCountDownComponent implements OnInit {
    @Input() gameName: string;

    constructor(private timeService: TimeService) {}

    get time() {
        return this.timeService.time;
    }

    ngOnInit(): void {
        this.timeService.startTimer(COUNTDOWN_TIME);
    }
}
