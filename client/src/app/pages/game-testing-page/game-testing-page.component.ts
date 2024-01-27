import { Component, HostListener, Input, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { GameHandlerService, GameState } from '@app/services/game-handler.service';
import { Subscription } from 'rxjs';

@Component({
    selector: 'app-game-testing-page',
    templateUrl: './game-testing-page.component.html',
    styleUrls: ['./game-testing-page.component.scss'],
})
export class GameTestingPageComponent implements OnInit, OnDestroy {
    @Input() gameId: number;

    answerConfirmed: boolean = false;
    showingAnswer: boolean = false;
    gameState = GameState;

    private gameStateSubscription: Subscription;

    constructor(
        public gameHandlerService: GameHandlerService,
        public router: Router,
    ) {
        this.gameStateSubscription = this.gameHandlerService.stateSubject.subscribe((state: GameState) => {
            switch (state) {
                case GameState.ShowQuestion:
                    this.answerConfirmed = false;
                this.showingAnswer = false;
                    break;
                case GameState.ShowAnswer:
                    this.answerConfirmed = true;
                    this.showingAnswer = true;
                    break;
                case GameState.GameEnded:
                    this.router.navigate(['/']);
                    break;
            }
        });
    }

    @HostListener('window:keyup', ['$event'])
    handleKeyUp(event: KeyboardEvent): void {
        if (!(event.key === 'Enter')) {
            return;
        }

        this.answerConfirmed = true;
    }

    ngOnInit(): void {
        this.gameHandlerService.startGame();
    }

    ngOnDestroy(): void {
        this.gameStateSubscription.unsubscribe();
    }
}
