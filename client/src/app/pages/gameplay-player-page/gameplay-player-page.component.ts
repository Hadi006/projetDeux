import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { GameHandlerService, GameState } from '@app/services/game-handler.service';
import { PlayerHandlerService } from '@app/services/player-handler.service';
import { Subscription } from 'rxjs';
import { Player } from '@app/interfaces/player';
import { QuestionHandlerService } from '@app/services/question-handler.service';

@Component({
    selector: 'app-gameplay-player-page',
    templateUrl: './gameplay-player-page.component.html',
    styleUrls: ['./gameplay-player-page.component.scss'],
})
export class GameplayPlayerPageComponent implements OnInit, OnDestroy {
    @Input() gameId: number;

    player: Player;
    showingAnswer: boolean = false;
    gameState = GameState;
    score: number = 0;

    private gameStateSubscription: Subscription;

    constructor(
        public gameHandlerService: GameHandlerService,
        private router: Router,
        private playerHandlerService: PlayerHandlerService,
    ) {
        this.player = this.playerHandlerService.createPlayer();

        this.gameStateSubscription = this.gameHandlerService.stateSubject.subscribe((state: GameState) => {
            switch (state) {
                case GameState.ShowQuestion:
                    this.showingAnswer = false;
                    break;
                case GameState.ShowAnswer:
                    this.showingAnswer = true;
                    this.score = this.player.score;
                    break;
                case GameState.GameEnded:
                    this.router.navigate(['/']);
                    break;
            }
        });
    }

    ngOnInit(): void {
        this.gameHandlerService.startGame();
    }

    ngOnDestroy(): void {
        this.gameStateSubscription.unsubscribe();
    }
}
