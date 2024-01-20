import { Component, Input, OnInit, HostListener } from '@angular/core';
import { GameData } from '@common/game-data';
import { QuestionData } from '@common/question-data';
import { TimeService } from '@app/services/time.service';

@Component({
    selector: 'app-game-testing-page',
    templateUrl: './game-testing-page.component.html',
    styleUrls: ['./game-testing-page.component.scss'],
})
export class GameTestingPageComponent implements OnInit {
    @Input() gameId: number;


    gameData: GameData;
    questionData: QuestionData;
    currentQuestionIndex: number = 0;
    isChecked: boolean[];

    @HostListener('window:keyup', ['$event'])
    handleKeyUp(event: KeyboardEvent): void {
        const key = parseInt(event.key, 10) - 1;

        if (key >= 0 && key < this.questionData.answers.length) {
            this.isChecked[key] = !this.isChecked[key];
        }
    }


    ngOnInit(): void {
        this.getGameData();
        this.getQuestionData(this.currentQuestionIndex);
        this.isChecked = new Array(this.questionData.answers.length);
    }

    getGameData(): void {
        const testGame: GameData = {
            id: 0,
            name: 'Math',
            questionIds: [],
        };

        this.gameData = testGame;
    }

    getQuestionData(id: number): void {
        const testQuestion: QuestionData = {
            id: 0,
            value: 1,
            question: '1+1=?',
            answers: ['1', '2', '3', '4'],
            correctAnswers: ['2'],
            isMCQ: true,
        };

        this.questionData = testQuestion;
    }
}
