import { Component, Input } from '@angular/core';

@Component({
    selector: 'app-waiting-room-info',
    templateUrl: './waiting-room-info.component.html',
    styleUrls: ['./waiting-room-info.component.scss'],
})
export class WaitingRoomInfoComponent {
    @Input() title: string;
    @Input() pin: string;
    @Input() nPlayers: number;
    @Input() leaveGame: () => void;
}
