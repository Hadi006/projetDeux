import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { AlertComponent } from '@app/components/alert/alert.component';
import { HostService } from '@app/services/host.service';

@Component({
    selector: 'app-lobby-organizer-page',
    templateUrl: './lobby-organizer-page.component.html',
    styleUrls: ['./lobby-organizer-page.component.scss'],
})
export class LobbyOrganizerPageComponent {
    constructor(
        private lobbyService: HostService,
        private router: Router,
        private dialog: MatDialog,
    ) {
        if (!this.lobbyService.createLobby()) {
            this.leaveLobby();
            this.dialog.open(AlertComponent, { data: { message: 'Maximum games reached' } });
        }
    }

    get lobbyData() {
        return this.lobbyService.lobbyData;
    }

    startGame() {
        this.lobbyService.lobbyData.started = true;
    }

    leaveLobby() {
        this.lobbyService.cleanUp();
        this.router.navigate(['/']);
    }
}
