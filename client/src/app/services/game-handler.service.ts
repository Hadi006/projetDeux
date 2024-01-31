import { Injectable } from '@angular/core';
import { GameData } from '@common/game-data';
import { QuestionData } from '@common/question-data';
import { BehaviorSubject, Subscription } from 'rxjs';
import { PlayerHandlerService } from '@app/services/player-handler.service';
import { GameTimersService } from '@app/services/game-timers.service';
import { QuestionHandlerService } from '@app/services/question-handler.service';
import { Player } from '@app/interfaces/player';

export enum GameState {
    ShowQuestion = 0,
    ShowAnswer = 1,
    GameEnded = 2,
}

const QUESTION_DATA: QuestionData[] = [
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
    questions: QUESTION_DATA,
    timePerQuestion: 10,
};

export const SHOW_ANSWER_DELAY = 3;

@Injectable({
    providedIn: 'root',
})
export class GameHandlerService {
    private gameData: GameData;
    private gameStateSubject: BehaviorSubject<GameState> = new BehaviorSubject<GameState>(GameState.ShowQuestion);
    private gameState: GameState = GameState.ShowQuestion;
    private confirmSubscriptions: Subscription[];
    private nAnswersConfirmed: number = 0;

    constructor(
        private gameTimersService: GameTimersService,
        private playerHandlerService: PlayerHandlerService,
        private questionHandlerService: QuestionHandlerService,
    ) {}

    get data(): GameData {
        return this.gameData;
    }

    get time(): number {
        switch (this.gameState) {
            case GameState.ShowQuestion: {
                return this.gameTimersService.getQuestionTime();
            }
            case GameState.ShowAnswer: {
                return this.gameTimersService.getAnswerTime();
            }
            case GameState.GameEnded: {
                return 0;
            }
            default: {
                return 0;
            }
        }
    }

    get stateSubject(): BehaviorSubject<GameState> {
        return this.gameStateSubject;
    }

    startGame(): void {
        this.confirmSubscriptions = [];
        this.playerHandlerService.players.forEach((player) => {
            this.createAnswerSubscription(player);
        });

        this.gameTimersService.createQuestionTimer(this.showAnswer.bind(this));
        this.gameTimersService.createAnswerTimer(this.setUpNextQuestion.bind(this));

        this.getGameData();
        this.setUpNextQuestion();
    }

    cleanUp(): void {
        this.confirmSubscriptions.forEach((subscription: Subscription) => {
            subscription.unsubscribe();
        });
    }

    private createAnswerSubscription(player: Player) {
        const answerSubscription: Subscription = player.answerNotifier.subscribe((isChecked) => {
            this.handlePlayerAnswer(player, isChecked);
        });

        this.confirmSubscriptions.push(answerSubscription);
    }

    private handlePlayerAnswer(player: Player, isChecked: boolean[]): void {
        player.score += this.questionHandlerService.calculateScore(isChecked);

        if (++this.nAnswersConfirmed >= this.playerHandlerService.nPlayers) {
            this.gameTimersService.setQuestionTime(0);
        }
    }

    private getGameData(): void {
        // TODO : Replace with a server call
        this.gameData = TEST_GAME;
        this.questionHandlerService.setQuestions(TEST_GAME.questions);
    }

    private updateGameState(gameState: GameState): void {
        this.gameStateSubject.next(gameState);
        this.gameState = gameState;
    }

    private setUpNextQuestion(): void {
        this.questionHandlerService.nextQuestion();

        if (!this.questionHandlerService.currentQuestion) {
            this.updateGameState(GameState.GameEnded);
        } else {
            this.updateGameState(GameState.ShowQuestion);
            this.gameTimersService.startQuestionTimer(this.gameData.timePerQuestion);
        }
    }

    private showAnswer(): void {
        this.updateGameState(GameState.ShowAnswer);
        this.gameTimersService.startAnswerTimer(SHOW_ANSWER_DELAY);
    }
}
