import { Component } from '@angular/core';
import { GameHandlerService } from '@app/services/game-handler.service';

@Component({
    selector: 'app-play-page',
    templateUrl: './play-page.component.html',
    styleUrls: ['./play-page.component.scss'],
})
export class PlayPageComponent {
    constructor(public gameHandler: GameHandlerService) {}
}
