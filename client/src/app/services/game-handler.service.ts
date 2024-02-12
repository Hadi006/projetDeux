import { Injectable, OnDestroy } from '@angular/core';
import { GameStateService } from '@app/services/game-state.service';
import { GameTimersService } from '@app/services/game-timers.service';
import { GameState, SHOW_ANSWER_DELAY, TEST_GAME } from '@common/constant';
import { GameData } from '@common/game-data';
import { Subject, Subscription } from 'rxjs';
import { QuestionHandlerService } from './question-handler.service';

@Injectable({
    providedIn: 'root',
})
export class GameHandlerService implements OnDestroy {
    private internalGameData: GameData;
    private timerEndedSubscription: Subscription;
    private internalGameEnded$: Subject<void> = new Subject<void>();

    constructor(
        private questionHandlerService: QuestionHandlerService,
        private gameTimersService: GameTimersService,
        private gameStateService: GameStateService,
    ) {
        this.subscribeToTimerEnded();
    }

    get gameData(): GameData {
        return this.internalGameData;
    }

    get gameEnded$(): Subject<void> {
        return this.internalGameEnded$;
    }

    loadGameData(/* TODO id: number */): void {
        // TODO: Load game data from server using id
        this.internalGameData = TEST_GAME;
    }

    startGame(): void {
        this.questionHandlerService.questionsData = this.internalGameData.questions;
        this.questionHandlerService.resetAnswers();
        this.gameTimersService.startQuestionTimer(this.internalGameData.timePerQuestion);
    }

    setUpNextState(): void {
        switch (this.gameStateService.gameState) {
            case GameState.ShowQuestion:
                this.gameTimersService.startAnswerTimer(SHOW_ANSWER_DELAY);
                this.gameStateService.gameState = GameState.ShowAnswer;
                break;
            case GameState.ShowAnswer:
                this.questionHandlerService.nextQuestion();
                if (!this.questionHandlerService.currentQuestion) {
                    this.internalGameEnded$.next();
                    this.gameStateService.gameState = GameState.GameEnded;
                } else {
                    this.gameTimersService.startQuestionTimer(this.internalGameData.timePerQuestion);
                    this.gameStateService.gameState = GameState.ShowQuestion;
                }
                break;
            default:
                this.internalGameEnded$.next();
                this.gameStateService.gameState = GameState.GameEnded;
                break;
        }
    }

    ngOnDestroy(): void {
        this.timerEndedSubscription.unsubscribe();
    }

    private subscribeToTimerEnded(): void {
        this.timerEndedSubscription = this.gameTimersService.timerEndedSubject.subscribe(() => {
            this.setUpNextState();
        });
    }
}
