import { Injectable } from '@angular/core';
import { GameData } from '@common/game-data';
import { QuestionData } from '@common/question-data';
import { Subscription } from 'rxjs';
import { GameStateService, GameState } from '@app/services/game-state.service';
import { GameTimersService } from '@app/services/game-timers.service';
import { QuestionHandlerService } from './question-handler.service';

const SHOW_ANSWER_DELAY = 3;

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
export class GameHandlerService {
    private internalGameData: GameData;
    private timerEndedSubscription: Subscription;

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

    loadGameData(/* TODO id: number */): void {
        // TODO: Load game data from server using id
        this.internalGameData = TEST_GAME;
    }

    startGame(): void {
        this.questionHandlerService.questionsData = this.internalGameData.questions;
        this.questionHandlerService.resetPlayerAnswers();
        this.gameTimersService.startQuestionTimer(TEST_GAME.timePerQuestion);
    }

    cleanup(): void {
        this.timerEndedSubscription.unsubscribe();
    }


    private subscribeToTimerEnded(): void {
        this.timerEndedSubscription = this.gameTimersService.timerEndedSubject.subscribe(() => {
            switch (this.gameStateService.gameState) {
                case GameState.ShowQuestion:
                    this.gameTimersService.startAnswerTimer(SHOW_ANSWER_DELAY);
                    this.gameStateService.gameState = GameState.ShowAnswer;
                    break;
                case GameState.ShowAnswer:
                    this.questionHandlerService.nextQuestion();
                    if (!this.questionHandlerService.currentQuestion) {
                        this.gameStateService.gameState = GameState.GameEnded;
                    } else {
                        this.gameTimersService.startQuestionTimer(TEST_GAME.timePerQuestion);
                        this.gameStateService.gameState = GameState.ShowQuestion;
                    }
                    break;
            }
        });
    }
}
