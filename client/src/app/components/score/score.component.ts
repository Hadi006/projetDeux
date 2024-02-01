import { Component, Input } from '@angular/core';
import { Player } from '@app/interfaces/player';

@Component({
    selector: 'app-score',
    templateUrl: './score.component.html',
    styleUrls: ['./score.component.scss'],
})
export class ScoreComponent {
    @Input() player: Player;
    score = 0;
}
