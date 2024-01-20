import { Component, Input, OnInit } from '@angular/core';
import { GameData } from '@common/game-data';
import { TimeService } from '@app/services/time.service';

@Component({
    selector: 'app-game-testing-page',
    templateUrl: './game-testing-page.component.html',
    styleUrls: ['./game-testing-page.component.scss'],
})
export class GameTestingPageComponent implements OnInit {
    @Input() gameId: number;

    currentQuestionIndex: number = 0;

    private gameData: GameData;

    constructor(private timeService: TimeService) {}

    get time(): number {
        return this.timeService.time;
    }

    ngOnInit(): void {
        this.getGameData();
        this.loadNextQuestion();
    }

    getGameData(): void {
        const testGame: GameData = {
            id: 0,
            name: 'Math',
            questionIds: [0, 1, 2, 3],
            timePerQuestion: 10,
        };

        this.gameData = testGame;
    }

    loadNextQuestion(): void {
        if (this.currentQuestionIndex >= this.gameData.questionIds.length) {
            // TODO : Afficher le score
            return;
        }

        this.timeService.startTimer(this.gameData.timePerQuestion, () => {
        this.currentQuestionIndex++;
            this.loadNextQuestion();
        });
    }
}
