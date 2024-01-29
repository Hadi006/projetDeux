import { Injectable } from '@angular/core';
import { GameData } from '@common/game-data';
import { QuestionData } from '@common/question-data';
import { BehaviorSubject, Subject, Subscription } from 'rxjs';
import { TimeService } from './time.service';
import { PlayerHandlerService } from '@app/services/player-handler.service';

export enum GameState {
    ShowQuestion = 0,
    ShowAnswer = 1,
    GameEnded = 2,
}

const SHOW_ANSWER_DELAY = 3;
const QUESTION_TIMER_INDEX = 0;
const ANSWER_TIMER_INDEX = 1;
const QUESTION_DATA: QuestionData[] = [
    {
        id: 0,
        points: 1,
        question: 'Quel est le résultat de 1 + 1 ?',
        answers: ['1', '2', '3', '4'],
        correctAnswers: ['2'],
        isMCQ: true,
    },
    {
        id: 1,
        points: 4,
        question: 'Question réponse libre',
        answers: [],
        correctAnswers: [],
        isMCQ: false,
    },
    {
        id: 2,
        points: 2,
        question: 'Quel est le résultat de 2 + 2 ?',
        answers: ['1', '2', '3', '4'],
        correctAnswers: ['4'],
        isMCQ: true,
    },
];

@Injectable({
    providedIn: 'root',
})
export class GameHandlerService {
    private gameData: GameData;
    private timerIds: number[] = new Array(2);
    private currentQuestionIndex: number = 0;
    private gameStateSubject: BehaviorSubject<GameState> = new BehaviorSubject<GameState>(GameState.ShowQuestion);
    private gameState: GameState = GameState.ShowQuestion;
    private gameStateSubscription: Subscription;
    private answerConfirmedSubscriptions: Subscription[] = [];
    private nPlayers: number;
    private nAnswersConfirmed: number = 0;

    constructor(
        private timeService: TimeService,
        private playerHandlerService: PlayerHandlerService,
    ) {
        this.gameStateSubscription = this.gameStateSubject.subscribe((state: GameState) => {
            this.gameState = state;
        });
    }

    get data() {
        return this.gameData;
    }

    get time(): number {
        switch (this.gameState) {
            case GameState.ShowQuestion: {
                return this.timeService.getTime(this.timerIds[QUESTION_TIMER_INDEX]);
            }
            case GameState.ShowAnswer: {
                return this.timeService.getTime(this.timerIds[ANSWER_TIMER_INDEX]);
            }
            case GameState.GameEnded: {
                return 0;
            }
            default: {
                return 0;
            }
        }
    }

    get currentQuestion(): QuestionData {
        return this.gameData.questions[this.currentQuestionIndex];
    }

    get stateSubject(): BehaviorSubject<GameState> {
        return this.gameStateSubject;
    }

    startGame(): void {
        this.nPlayers = this.playerHandlerService.answerConfirmedNotifiers.length;
        this.playerHandlerService.answerConfirmedNotifiers.forEach((subject: Subject<void>) => {
            const answerConfirmedSubscription: Subscription = subject.subscribe(() => {
                if (++this.nAnswersConfirmed >= this.nPlayers) {
                    this.showAnswer();
                }
            });
            this.answerConfirmedSubscriptions.push(answerConfirmedSubscription);
        });

        this.timerIds[0] = this.timeService.createTimer(() => {
            this.showAnswer();
        });
        this.timerIds[1] = this.timeService.createTimer(() => {
            this.currentQuestionIndex++;
            this.resetGameState();
        });

        this.getGameData();
        this.resetGameState();
    }

    getGameData(): void {
        // TODO : Replace with a server call
        const testGame: GameData = {
            id: 0,
            name: 'Math',
            questions: QUESTION_DATA,
            timePerQuestion: 10,
        };

        this.gameData = testGame;
    }

    resetGameState(): void {
        if (this.currentQuestionIndex >= this.gameData.questions.length) {
            this.gameStateSubject.next(GameState.GameEnded);
        } else {
            this.gameStateSubject.next(GameState.ShowQuestion);

            this.timeService.startTimer(this.timerIds[QUESTION_TIMER_INDEX], this.gameData.timePerQuestion);
        }
    }

    showAnswer(): void {
        this.gameStateSubject.next(GameState.ShowAnswer);

        this.timeService.startTimer(this.timerIds[ANSWER_TIMER_INDEX], SHOW_ANSWER_DELAY);
    }

    cleanUp(): void {
        this.gameStateSubscription.unsubscribe();
        this.answerConfirmedSubscriptions.forEach((subscription: Subscription) => {
            subscription.unsubscribe();
        });
    }
}
