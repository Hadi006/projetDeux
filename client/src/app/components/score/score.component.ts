import { Component, Input, OnDestroy } from '@angular/core';
import { Player } from '@app/interfaces/player';
import { ScoreService } from '@app/services/score.service';

@Component({
    selector: 'app-score',
    templateUrl: './score.component.html',
    styleUrls: ['./score.component.scss'],
})
export class ScoreComponent implements OnDestroy {
    @Input() player: Player;

    constructor(private scoreService: ScoreService) {}

    ngOnDestroy(): void {
        this.scoreService.cleanUp();
    }
}
