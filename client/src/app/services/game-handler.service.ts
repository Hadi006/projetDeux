import { Injectable, OnDestroy } from '@angular/core';
import { Subject, Subscription } from 'rxjs';
import { GameStateService, GameState } from '@app/services/game-state.service';
import { GameTimersService } from '@app/services/game-timers.service';
import { QuestionHandlerService } from './question-handler.service';
import { Quiz } from '@common/quiz';

export const SHOW_ANSWER_DELAY = 3;

@Injectable({
    providedIn: 'root',
})
export class GameHandlerService implements OnDestroy {
    private internalQuizData: Quiz;
    private timerEndedSubscription: Subscription;
    private internalGameEnded$: Subject<void> = new Subject<void>();

    constructor(
        private questionHandlerService: QuestionHandlerService,
        private gameTimersService: GameTimersService,
        private gameStateService: GameStateService,
    ) {
        this.subscribeToTimerEnded();
    }

    get quizData(): Quiz {
        return this.internalQuizData;
    }

    get gameEnded$(): Subject<void> {
        return this.internalGameEnded$;
    }

    loadQuizData(quizData: Quiz): void {
        this.internalQuizData = quizData;
    }

    startGame(): void {
        this.questionHandlerService.questionsData = this.internalQuizData.questions;
        this.questionHandlerService.resetAnswers();
        this.gameTimersService.startQuestionTimer(this.internalQuizData.duration);
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
