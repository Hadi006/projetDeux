import { Component, Input } from '@angular/core';

@Component({
    selector: 'app-game-count-down',
    templateUrl: './game-count-down.component.html',
    styleUrls: ['./game-count-down.component.scss'],
})
export class GameCountDownComponent {
    @Input() gameName: string;
    @Input() time: number;
}
