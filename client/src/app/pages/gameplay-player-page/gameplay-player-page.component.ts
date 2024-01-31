import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { GameHandlerService, GameState } from '@app/services/game-handler.service';
import { PlayerHandlerService } from '@app/services/player-handler.service';
import { Subscription } from 'rxjs';
import { Player } from '@app/interfaces/player';

@Component({
    selector: 'app-gameplay-player-page',
    templateUrl: './gameplay-player-page.component.html',
    styleUrls: ['./gameplay-player-page.component.scss'],
})
export class GameplayPlayerPageComponent implements OnInit, OnDestroy {
    @Input() gameId: number;

    private internalPlayer: Player;
    private internalShowingAnswer: boolean;
    private internalScore: number;
    private gameStateSubscription: Subscription;

    constructor(
        public gameHandlerService: GameHandlerService,
        private router: Router,
        private playerHandlerService: PlayerHandlerService,
    ) {
        this.internalPlayer = this.playerHandlerService.createPlayer();

        this.gameStateSubscription = this.gameHandlerService.stateSubject.subscribe((state: GameState) => {
            switch (state) {
                case GameState.ShowQuestion:
                    this.internalShowingAnswer = false;
                    break;
                case GameState.ShowAnswer:
                    this.internalShowingAnswer = true;
                    this.internalScore = this.internalPlayer.score;
                    break;
                case GameState.GameEnded:
                    this.router.navigate(['/']);
                    break;
            }
        });
    }

    get player(): Player | undefined {
        return this.internalPlayer;
    }

    get showingAnswer(): boolean | undefined {
        return this.internalShowingAnswer;
    }

    get score(): number | undefined {
        return this.internalScore;
    }

    ngOnInit(): void {
        this.gameHandlerService.startGame();
    }

    ngOnDestroy(): void {
        this.gameStateSubscription.unsubscribe();
    }
}
