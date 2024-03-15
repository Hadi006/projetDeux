import { Component, Input } from '@angular/core';
import { TimeService } from '@app/services/time.service';
import { START_GAME_COUNTDOWN } from '@common/constant';

@Component({
    selector: 'app-game-count-down',
    templateUrl: './game-count-down.component.html',
    styleUrls: ['./game-count-down.component.scss'],
})
export class GameCountDownComponent {
    @Input() gameName: string;

    private timerId: number;

    constructor(private timeService: TimeService) {
        this.timerId = this.timeService.createTimerById();
    }

    getTime() {
        return this.timeService.getTimeById(this.timerId);
    }
}
