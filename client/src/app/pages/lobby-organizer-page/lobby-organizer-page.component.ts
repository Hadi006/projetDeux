import { Component, OnInit, Input } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { LobbyData } from '@common/lobby-data';

@Component({
    selector: 'app-lobby-organizer-page',
    templateUrl: './lobby-organizer-page.component.html',
    styleUrls: ['./lobby-organizer-page.component.scss'],
})
export class LobbyOrganizerPageComponent {
    lobbyId: number;
    lobbyData: LobbyData;

    constructor(private readonly route: ActivatedRoute) {
        this.lobbyId = this.route.snapshot.params.id;
    }
}
