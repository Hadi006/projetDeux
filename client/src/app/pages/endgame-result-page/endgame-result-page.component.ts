import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Game } from '@common/game';

@Component({
    selector: 'app-endgame-result-page',
    templateUrl: './endgame-result-page.component.html',
    styleUrls: ['./endgame-result-page.component.scss'],
})
export class EndgameResultPageComponent implements OnInit {
    game: Game;
    name: string;
    currentHistogramIndex = 0;
    constructor(private router: Router) {}

    ngOnInit() {
        this.name = history.state.name;
        this.game = history.state.game;
        this.game.players = [...this.game.players, ...this.game.quitters];
        this.game.players.sort((a, b) => {
            return b.score - a.score || a.name.localeCompare(b.name);
        });
    }

    leaveGame() {
        this.router.navigate(['/']);
    }

    previousHistogram() {
        this.currentHistogramIndex = Math.max(0, this.currentHistogramIndex - 1);
    }

    nextHistogram() {
        this.currentHistogramIndex = Math.min(this.game.histograms.length - 1, this.currentHistogramIndex + 1);
    }
}
