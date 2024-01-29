import { Component, HostListener, Input, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { GameHandlerService, GameState } from '@app/services/game-handler.service';
import { PlayerHandlerService } from '@app/services/player-handler.service';
import { Subscription, Subject } from 'rxjs';

@Component({
    selector: 'app-gameplay-player-page',
    templateUrl: './gameplay-player-page.component.html',
    styleUrls: ['./gameplay-player-page.component.scss'],
})
export class GameplayPlayerPageComponent implements OnInit, OnDestroy {
    @Input() gameId: number;

    answerConfirmed: boolean = false;
    showingAnswer: boolean = false;
    gameState = GameState;

    private gameStateSubscription: Subscription;
    private answerConfirmedNotifier: Subject<void> = new Subject<void>();

    constructor(
        public gameHandlerService: GameHandlerService,
        private router: Router,
        private playerHandlerService: PlayerHandlerService,
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
        this.answerConfirmedNotifier.next();
    }

    ngOnInit(): void {
        this.playerHandlerService.answerConfirmedNotifiers.push(this.answerConfirmedNotifier);
        this.gameHandlerService.startGame();
    }

    ngOnDestroy(): void {
        this.gameStateSubscription.unsubscribe();
    }
}
