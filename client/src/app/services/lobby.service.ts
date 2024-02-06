import { Injectable } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Injectable({
    providedIn: 'root',
})
export class LobbyService {
    lobbyId: number;

    constructor(private readonly route: ActivatedRoute) {
        this.lobbyId = this.route.snapshot.params.id;
    }
}
