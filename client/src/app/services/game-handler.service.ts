import { Injectable } from '@angular/core';
import { GameData } from '@common/game-data';
import { QuestionData } from '@common/question-data';
import { BehaviorSubject, Subscription } from 'rxjs';
import { PlayerHandlerService } from '@app/services/player-handler.service';
import { GameTimersService } from '@app/services/game-timers.service';

export enum GameState {
    ShowQuestion = 0,
    ShowAnswer = 1,
    GameEnded = 2,
}

const GOOD_ANSWER_MULTIPLIER = 1.2;
const SHOW_ANSWER_DELAY = 3;
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
    private currentQuestionIndex: number = 0;
    private gameStateSubject: BehaviorSubject<GameState> = new BehaviorSubject<GameState>(GameState.ShowQuestion);
    private gameState: GameState = GameState.ShowQuestion;
    private gameStateSubscription: Subscription;
    private confirmSubscriptions: Subscription[];
    private nAnswersConfirmed: number = 0;

    constructor(
        private gameTimersService: GameTimersService,
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

    get currentQuestion(): QuestionData {
        return this.gameData.questions[this.currentQuestionIndex];
    }

    get stateSubject(): BehaviorSubject<GameState> {
        return this.gameStateSubject;
    }

    startGame(): void {
        this.subscribeToPlayerAnswers();
        this.gameTimersService.createQuestionTimer(this.showAnswer.bind(this));
        this.gameTimersService.createAnswerTimer(this.setUpNextQuestion.bind(this));

        this.getGameData();
        this.resetGameState();
    }

    subscribeToPlayerAnswers(): void {
        this.confirmSubscriptions = [];

        this.playerHandlerService.players.forEach((player) => {
            const confirmSubscription: Subscription = player.answerNotifier.subscribe((isChecked) => {
                player.score += this.calculateScore(isChecked);

                if (++this.nAnswersConfirmed >= this.playerHandlerService.nPlayers) {
                    this.gameTimersService.setQuestionTime(0);
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
            this.gameTimersService.startQuestionTimer(this.gameData.timePerQuestion);
        }
    }

    showAnswer(): void {
        this.gameStateSubject.next(GameState.ShowAnswer);
        this.gameTimersService.startAnswerTimer(SHOW_ANSWER_DELAY);
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
            if (checked) {
                isCorrect = this.currentQuestion.correctAnswers.includes(this.currentQuestion.answers[index]);
            } else {
                isCorrect = !this.currentQuestion.correctAnswers.includes(this.currentQuestion.answers[index]);
            }
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
