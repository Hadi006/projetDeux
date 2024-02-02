import { Component } from '@angular/core';

@Component({
    selector: 'app-join-game-page',
    templateUrl: './join-game-page.component.html',
    styleUrls: ['./join-game-page.component.scss'],
})
export class JoinGamePageComponent {
    partyNIP: string = '';

    submitNip() {
        console.log(`Server: ${this.partyNIP} - NIP Submitted`);
    }
}
