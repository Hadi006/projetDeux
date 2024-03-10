import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { TimeService } from '@app/services/time.service';
import { START_GAME_COUNTDOWN } from '@common/constant';

@Component({
    selector: 'app-game-count-down',
    templateUrl: './game-count-down.component.html',
    styleUrls: ['./game-count-down.component.scss'],
})
export class GameCountDownComponent implements OnInit {
    @Input() gameName: string;

    private timerId: number;

    constructor(
        private timeService: TimeService,
        private router: Router,
    ) {
        this.timerId = this.timeService.createTimerById(this.startGame.bind(this));
    }

    get time() {
        return this.timeService.getTimeById(this.timerId);
    }

    ngOnInit(): void {
        this.timeService.startTimerById(this.timerId, START_GAME_COUNTDOWN);
    }

    private startGame() {
        this.router.navigate(['/']);
    }
}
