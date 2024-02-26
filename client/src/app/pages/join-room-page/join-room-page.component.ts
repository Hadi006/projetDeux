import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
    selector: 'app-join-room-page',
    templateUrl: './join-room-page.component.html',
    styleUrls: ['./join-room-page.component.scss'],
})
export class JoinRoomPageComponent {
    partyNIP: string = '';
    constructor(private router: Router) {}
    /**
     * Function that is called when user submits the NIP
     */
    submitNip() {}

    onOkButtonClick(): void {
        this.router.navigate(['/home/join-game/select-name']);
    }
}
