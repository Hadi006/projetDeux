import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { HostService } from '@app/services/host.service';
import { PlayerHandlerService } from '@app/services/player-handler.service';
import { Player } from '@common/player';

@Component({
    selector: 'app-gameplay-player-page',
    templateUrl: './gameplay-player-page.component.html',
    styleUrls: ['./gameplay-player-page.component.scss'],
})
export class GameplayPlayerPageComponent implements OnInit {
    player: Player;

    constructor(
        private hostService: HostService,
        private playerHandlerService: PlayerHandlerService,
        private router: Router,
    ) {}

    ngOnInit(): void {
        if (!this.hostService.lobbyData.quiz) {
            this.router.navigate(['game']);
        }

        this.playerHandlerService.connect();
        this.playerHandlerService.createPlayer(this.hostService.lobbyData.id, 'Test').subscribe(() => {
            this.player = this.playerHandlerService.player;
            this.hostService.nextQuestion();
        });
    }
}
