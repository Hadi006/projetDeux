import { Component, Input } from '@angular/core';
import { WebSocketSubject } from 'rxjs/webSocket';
import { map, filter } from 'rxjs/operators';
import { LobbyData } from '@common/lobby-data';
import { ActivatedRoute } from '@angular/router';

@Component({
    selector: 'app-lobby-organizer-page',
    templateUrl: './lobby-organizer-page.component.html',
    styleUrls: ['./lobby-organizer-page.component.scss'],
})
export class LobbyOrganizerPageComponent {
    private readonly webSocket: WebSocketSubject<any>;
    private readonly socketUrl: string = 'ws://localhost:3000';
    lobbyData: LobbyData;

    @Input() lobbyId: number;

    constructor(private readonly route: ActivatedRoute) {
        this.webSocket = new WebSocketSubject(this.socketUrl);
        this.lobbyId = this.route.snapshot.params.id;
    }

    ngOnInit(): void {
        this.subscribeToLobby();
    }

    subscribeToLobby = () => {
        const data = this.webSocket.pipe(
            filter((message) => message.type === 'lobbyData'),
            map((message) => message.data),
        );

        data.subscribe((lobbyData) => {
            if (lobbyData.id === this.lobbyId) {
                this.lobbyData = lobbyData;
            }
        });

        const testPlayersData = [
            { id: 1, name: 'Player 1' },
            { id: 2, name: 'Player 2' },
        ];
        const testGameData = { id: 1, name: 'Math' };
        const testLobbyData: LobbyData = {
            id: 1,
            players: testPlayersData,
            game: testGameData,
            started: false,
        };

        this.lobbyData = testLobbyData;
    };

    startGame = () => {
        this.lobbyData.started = true;
    };
}
