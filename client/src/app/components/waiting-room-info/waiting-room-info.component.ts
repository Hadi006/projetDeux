import { Component, Input } from '@angular/core';
import { Game } from '@common/game';

@Component({
    selector: 'app-waiting-room-info',
    templateUrl: './waiting-room-info.component.html',
    styleUrls: ['./waiting-room-info.component.scss'],
})
export class WaitingRoomInfoComponent {
    @Input() game: Game;
    @Input() leaveGame: () => void;
}
