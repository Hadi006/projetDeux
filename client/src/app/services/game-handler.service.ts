import { Injectable } from '@angular/core';
import { GameState, SHOW_ANSWER_DELAY } from '@common/constant';
import { Quiz } from '@common/quiz';
import { Subject, Subscription } from 'rxjs';
import { GameManagementService } from './game-management.service';
import { GameSocketsService } from './game-sockets.service';
import { QuestionHandlerService } from './question-handler.service';

@Injectable({
    providedIn: 'root',
})
export class GameHandlerService {
    private internalQuizData: Quiz | undefined;
    private timerEndedSubscription: Subscription;
    private internalGameEnded$: Subject<void> = new Subject<void>();

    constructor(
        private questionHandlerService: QuestionHandlerService,
        private gameManagementService: GameManagementService,
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
        this.gameManagementService.startQuestionTimer(this.internalQuizData.duration);
        this.gameManagementService.gameState = GameState.ShowQuestion;
    }

    setUpNextState(): void {
        if (!this.internalQuizData) {
            return;
        }

        switch (this.gameManagementService.gameState) {
            case GameState.ShowQuestion:
                this.gameManagementService.startAnswerTimer(SHOW_ANSWER_DELAY);
                this.gameManagementService.gameState = GameState.ShowAnswer;
                break;
            case GameState.ShowAnswer:
                this.questionHandlerService.nextQuestion();
                if (!this.questionHandlerService.currentQuestion) {
                    this.internalGameEnded$.next();
                    this.gameManagementService.gameState = GameState.GameEnded;
                } else {
                    this.gameManagementService.startQuestionTimer(this.internalQuizData.duration);
                    this.gameManagementService.gameState = GameState.ShowQuestion;
                }
                break;
            default:
                this.internalGameEnded$.next();
                this.gameManagementService.gameState = GameState.GameEnded;
                break;
        }
    }

    cleanUp() {
        this.timerEndedSubscription.unsubscribe();
    }

    private subscribeToTimerEnded(): void {
        this.timerEndedSubscription = this.gameManagementService.timerEndedSubject.subscribe(() => {
            this.setUpNextState();
        });
    }
}
