import { Component, HostListener, Input, OnInit } from '@angular/core';
import { TimeService } from '@app/services/time.service';
import { GameData } from '@common/game-data';
import { QuestionData } from '@common/question-data';

const SHOW_ANSWER_DELAY = 3;
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

    private timerId: number;

    constructor(private timeService: TimeService) {}

    get time(): number {
        return this.timeService.getTime(this.timerId);
    }

    @HostListener('window:keyup', ['$event'])
    handleKeyUp(event: KeyboardEvent): void {
        if (!(event.key === 'Enter')) {
            return;
        }
        this.confirmAnswer();
    }

    ngOnInit(): void {
        this.getGameData();
        this.loadQuestion();
    }

    getGameData(): void {
        const testGame: GameData = {
            id: 0,
            name: 'Math',
            questions: QUESTION_DATA,
            timePerQuestion: 10,
        };

        this.gameData = testGame;
    }

    loadQuestion(): void {
        this.timeService.stopTimer(this.timerId);
        if (this.currentQuestionIndex >= this.gameData.questions.length) {
            // TODO : Afficher le score
            return;
        }

        this.answerConfirmed = false;
        this.showingAnswer = false;

        this.timerId = this.timeService.createTimer(() => {
            this.showAnswer();
        });
        this.timeService.startTimer(this.timerId, this.gameData.timePerQuestion);
    }

    showAnswer(): void {
        this.timeService.stopTimer(this.timerId);
        this.answerConfirmed = true;
        this.showingAnswer = true;

        this.timerId = this.timeService.createTimer(() => {
            this.currentQuestionIndex++;
            this.loadQuestion();
        });
        this.timeService.startTimer(this.timerId, SHOW_ANSWER_DELAY);
    }

    confirmAnswer(): void {
        this.answerConfirmed = true;
    }
}
