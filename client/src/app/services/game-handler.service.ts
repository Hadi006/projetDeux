import { Injectable, OnDestroy } from '@angular/core';
import { GameStateService } from '@app/services/game-state.service';
import { GameTimersService } from '@app/services/game-timers.service';
import { GameState, SHOW_ANSWER_DELAY } from '@common/constant';
import { Quiz } from '@common/quiz';
import { Subject, Subscription } from 'rxjs';
import { QuestionHandlerService } from './question-handler.service';

@Injectable({
    providedIn: 'root',
})
export class GameHandlerService implements OnDestroy {
    private internalQuizData: Quiz | undefined;
    private timerEndedSubscription: Subscription;
    private internalGameEnded$: Subject<void> = new Subject<void>();

    constructor(
        private questionHandlerService: QuestionHandlerService,
        private gameTimersService: GameTimersService,
        private gameStateService: GameStateService,
    ) {
        this.subscribeToTimerEnded();
    }

    get quizData(): Quiz | undefined {
        return this.internalQuizData;
    }

    get gameEnded$(): Subject<void> {
        return this.internalGameEnded$;
    }

    loadQuizData(quizData: Quiz | undefined): void {
        this.internalQuizData = quizData;
    }

    startGame(): void {
        if (!this.internalQuizData) {
            return;
        }

        this.questionHandlerService.questionsData = this.internalQuizData.questions;
        this.questionHandlerService.resetAnswers();
        this.gameTimersService.startQuestionTimer(this.internalQuizData.duration);
        this.gameStateService.gameState = GameState.ShowQuestion;
    }

    setUpNextState(): void {
        if (!this.internalQuizData) {
            return;
        }

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
                    this.gameTimersService.startQuestionTimer(this.internalQuizData.duration);
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
