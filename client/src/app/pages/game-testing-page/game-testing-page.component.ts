import { Component, HostListener, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { TimeService } from '@app/services/time.service';
import { GameData } from '@common/game-data';
import { QuestionData } from '@common/question-data';

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

@Component({
    selector: 'app-game-testing-page',
    templateUrl: './game-testing-page.component.html',
    styleUrls: ['./game-testing-page.component.scss'],
})
export class GameTestingPageComponent implements OnInit {
    @Input() gameId: number;

    answerConfirmed: boolean = false;
    showingAnswer: boolean = false;
    currentQuestionIndex: number = 0;
    gameData: GameData;

    private timerIds: number[] = new Array(2);

    constructor(
        private timeService: TimeService,
        public router: Router,
    ) {}

    get time(): number {
        if (this.showingAnswer) {
            return this.timeService.getTime(this.timerIds[ANSWER_TIMER_INDEX]);
        } else {
            return this.timeService.getTime(this.timerIds[QUESTION_TIMER_INDEX]);
        }
    }

    @HostListener('window:keyup', ['$event'])
    handleKeyUp(event: KeyboardEvent): void {
        if (!(event.key === 'Enter')) {
            return;
        }

        this.answerConfirmed = true;
    }

    ngOnInit(): void {
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
            // TODO : Replace with correct link
            this.router.navigate(['']);
        }

        this.answerConfirmed = false;
        this.showingAnswer = false;

        this.timeService.startTimer(this.timerIds[QUESTION_TIMER_INDEX], this.gameData.timePerQuestion);
    }

    showAnswer(): void {
        this.answerConfirmed = true;
        this.showingAnswer = true;

        this.timeService.startTimer(this.timerIds[ANSWER_TIMER_INDEX], SHOW_ANSWER_DELAY);
    }
}
