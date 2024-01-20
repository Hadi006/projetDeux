import { Component, Input, OnInit } from '@angular/core';
import { GameData } from '@common/game-data';
import { QuestionData } from '@common/question-data';

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

    ngOnInit(): void {
        this.getGameData();
        this.getQuestionData(this.currentQuestionIndex);
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
