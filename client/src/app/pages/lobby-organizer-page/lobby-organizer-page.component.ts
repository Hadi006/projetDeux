import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { AlertComponent } from '@app/components/alert/alert.component';
import { HostService } from '@app/services/host.service';
import { START_GAME_COUNTDOWN } from '@common/constant';

@Component({
    selector: 'app-lobby-organizer-page',
    templateUrl: './lobby-organizer-page.component.html',
    styleUrls: ['./lobby-organizer-page.component.scss'],
})
export class LobbyOrganizerPageComponent {
    constructor(
        public hostService: HostService,
        private dialog: MatDialog,
    ) {
        this.hostService.handleSockets();
        this.hostService.createLobby().subscribe((success) => {
            if (!success) {
                this.leaveLobby();
                this.dialog.open(AlertComponent, { data: { message: 'Maximum games reached' } });
            }
        });
    }

    get lobbyData() {
        return this.hostService.lobbyData;
    }

    startGame() {
        this.hostService.startCountdown(START_GAME_COUNTDOWN);
    }

    leaveLobby() {
        this.hostService.cleanUp();
    }
}
