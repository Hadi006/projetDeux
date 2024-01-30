import { Injectable } from '@angular/core';
import { GameData } from '@common/game-data';
import { QuestionData } from '@common/question-data';
import { BehaviorSubject, Subscription } from 'rxjs';
import { PlayerHandlerService } from '@app/services/player-handler.service';
import { TimeService } from '@app/services/time.service';

export enum GameState {
    ShowQuestion = 0,
    ShowAnswer = 1,
    GameEnded = 2,
}

const GOOD_ANSWER_MULTIPLIER = 1.2;
const SHOW_ANSWER_DELAY = 3;
const QUESTION_TIMER_INDEX = 0;
const ANSWER_TIMER_INDEX = 1;
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
    private confirmSubscriptions: Subscription[];
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
        this.subscribeToPlayerAnswers();
        this.timerIds[0] = this.timeService.createTimer(this.showAnswer.bind(this));
        this.timerIds[1] = this.timeService.createTimer(this.setUpNextQuestion.bind(this));

        this.getGameData();
        this.resetGameState();
    }

    subscribeToPlayerAnswers(): void {
        this.confirmSubscriptions = [];

        this.playerHandlerService.players.forEach((player) => {
            const confirmSubscription: Subscription = player.answerNotifier.subscribe((isChecked) => {
                player.score += this.calculateScore(isChecked);

                if (++this.nAnswersConfirmed >= this.playerHandlerService.nPlayers) {
                    this.timeService.setTime(this.timerIds[QUESTION_TIMER_INDEX], 0);
                }
            });

            this.confirmSubscriptions.push(confirmSubscription);
        });
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

    setUpNextQuestion(): void {
        this.currentQuestionIndex++;
        this.resetGameState();
    }

    calculateScore(isChecked: boolean[]): number {
        const maxGrade: number = this.currentQuestion.points * GOOD_ANSWER_MULTIPLIER;
        if (!this.currentQuestion.isMCQ) {
            return maxGrade;
        }

        let isCorrect = true;
        isChecked.forEach((checked: boolean, index: number) => {
            isCorrect = checked === this.currentQuestion.correctAnswers.includes(this.currentQuestion.answers[index]);
        });

        return isCorrect ? maxGrade : 0;
    }

    cleanUp(): void {
        this.gameStateSubscription.unsubscribe();
        this.confirmSubscriptions.forEach((subscription: Subscription) => {
            subscription.unsubscribe();
        });
    }
}
