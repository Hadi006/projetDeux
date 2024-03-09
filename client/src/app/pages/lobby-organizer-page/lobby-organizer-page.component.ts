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
        private hostService: HostService,
        private router: Router,
        private dialog: MatDialog,
    ) {
        if (!this.hostService.createLobby()) {
            this.leaveLobby();
            this.dialog.open(AlertComponent, { data: { message: 'Maximum games reached' } });
        }
    }

    get lobbyData() {
        return this.hostService.lobbyData;
    }

    startGame() {
        this.hostService.lobbyData.started = true;
    }

    leaveLobby() {
        this.hostService.cleanUp();
        this.router.navigate(['/']);
    }
}
