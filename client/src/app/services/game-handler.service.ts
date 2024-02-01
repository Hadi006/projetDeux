import { Injectable } from '@angular/core';
import { GameData } from '@common/game-data';
import { QuestionData } from '@common/question-data';
import { Subscription } from 'rxjs';
import { GameTimersService } from './game-timers.service';
import { PlayerHandlerService } from './player-handler.service';
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
export class GameHandlerService {
    private internalGameData: GameData;
    private answerConfirmedSubscription: Subscription;
    private nAnsweredPlayers = 0;

    constructor(
        private questionHandlerService: QuestionHandlerService,
        private gameTimersService: GameTimersService,
        private playerHandlerService: PlayerHandlerService,
    ) {
        this.answerConfirmedSubscription = this.playerHandlerService.answerConfirmedSubject.subscribe(() => {
            if (++this.nAnsweredPlayers <= this.playerHandlerService.nPlayers) {
                this.gameTimersService.stopQuestionTimer();
            }
        });
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
}
