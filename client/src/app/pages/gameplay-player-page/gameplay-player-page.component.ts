import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { GameHandlerService, GameState } from '@app/services/game-handler.service';
import { PlayerHandlerService } from '@app/services/player-handler.service';
import { Subscription } from 'rxjs';

@Component({
    selector: 'app-gameplay-player-page',
    templateUrl: './gameplay-player-page.component.html',
    styleUrls: ['./gameplay-player-page.component.scss'],
})
export class GameplayPlayerPageComponent implements OnInit, OnDestroy {
    @Input() gameId: number;

    showingAnswer: boolean = false;
    gameState = GameState;
    answerConfirmedSubscription: Subscription;
    grade: number = 0;

    private gameStateSubscription: Subscription;

    constructor(
        public gameHandlerService: GameHandlerService,
        private router: Router,
        private playerHandlerService: PlayerHandlerService,
    ) {
        this.gameStateSubscription = this.gameHandlerService.stateSubject.subscribe((state: GameState) => {
            switch (state) {
                case GameState.ShowQuestion:
                    this.showingAnswer = false;
                    break;
                case GameState.ShowAnswer:
                    this.showingAnswer = true;
                    break;
                case GameState.GameEnded:
                    this.router.navigate(['/']);
                    break;
            }
        });

        this.answerConfirmedSubscription = this.playerHandlerService.createAnswerConfirmedNotifier().subscribe((grade: number) => {
            this.grade = grade;
        });
    }

    ngOnInit(): void {
        this.gameHandlerService.startGame();
    }

    ngOnDestroy(): void {
        this.gameStateSubscription.unsubscribe();
        this.answerConfirmedSubscription.unsubscribe();
    }
}
