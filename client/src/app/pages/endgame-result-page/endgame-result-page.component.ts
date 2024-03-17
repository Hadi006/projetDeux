import { Component, OnInit } from '@angular/core';
import { HostService } from '@app/services/host.service';
import { PlayerService } from '@app/services/player.service';
import { Game } from '@common/game';

@Component({
    selector: 'app-endgame-result-page',
    templateUrl: './endgame-result-page.component.html',
    styleUrls: ['./endgame-result-page.component.scss'],
})
export class EndgameResultPageComponent implements OnInit {
    game: Game;
    currentHistogramIndex = 0;
    constructor(
        private playerService: PlayerService,
        private hostService: HostService,
    ) { }

    ngOnInit() {
        this.hostService.gameEndedSubject.subscribe((game: Game) => {
            this.game = game;
        });

        this.playerService.endGameSubject.subscribe((game: Game | void) => {
            if (!game) {
                return;
            }

            this.game = game;
            this.game.players.sort((a, b) => {
                if (a.score === b.score) {
                    return a.name.localeCompare(b.name);
                }
                return b.score - a.score;
            });
        });
        // this.game = this.hostService.game;
    }

    leaveGame() {
        this.playerService.cleanUp();
        this.hostService.leaveGame();
    }

    previousHistogram() {
        this.currentHistogramIndex = Math.max(0, this.currentHistogramIndex - 1);
    }

    nextHistogram() {
        this.currentHistogramIndex = Math.min(this.hostService.histograms.length - 1, this.currentHistogramIndex + 1);
    }
}
