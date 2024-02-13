import { Injectable, OnDestroy } from '@angular/core';
import { GameStateService } from '@app/services/game-state.service';
import { GameTimersService } from '@app/services/game-timers.service';
import { GameState, SHOW_ANSWER_DELAY } from '@common/constant';
import { GameData } from '@common/game-data';
import { QuestionData } from '@common/question-data';
import { Quiz } from '@common/quiz';
import { Subject, Subscription } from 'rxjs';
import { QuestionHandlerService } from './question-handler.service';

export const QUESTIONS_DATA: QuestionData[] = [
    {
        id: 0,
        points: 1,
        question: '1+1?',
        answers: ['1', '2', '3', '4'],
        correctAnswers: ['2'],
        isMCQ: true,
    },
    {
        id: 1,
        points: 4,
        question: 'Open ended question',
        answers: [],
        correctAnswers: [],
        isMCQ: false,
    },
    {
        id: 2,
        points: 2,
        question: '2+2?',
        answers: ['1', '2', '3', '4'],
        correctAnswers: ['4'],
        isMCQ: true,
    },
];
export const TEST_GAME: GameData = {
    id: 0,
    name: 'Math',
    questions: QUESTIONS_DATA,
    timePerQuestion: 10,
};

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
