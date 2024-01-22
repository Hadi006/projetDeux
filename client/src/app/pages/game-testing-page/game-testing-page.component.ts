import { Component, Input, OnInit, HostListener } from '@angular/core';
import { GameData } from '@common/game-data';
import { TimeService } from '@app/services/time.service';

@Component({
    selector: 'app-game-testing-page',
    templateUrl: './game-testing-page.component.html',
    styleUrls: ['./game-testing-page.component.scss'],
})
export class GameTestingPageComponent implements OnInit {
    @Input() gameId: number;

    answerConfirmed: boolean = false;
    currentQuestionIndex: number = 0;

    private timerId: number;
    private gameData: GameData;

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
        this.loadNextQuestion();
    }

    getGameData(): void {
        const testGame: GameData = {
            id: 0,
            name: 'Math',
            questionIds: [0, 1, 2],
            timePerQuestion: 10,
        };

        this.gameData = testGame;
    }

    loadNextQuestion(): void {
        if (this.currentQuestionIndex >= this.gameData.questionIds.length) {
            // TODO : Afficher le score
            return;
        }

        this.timerId = this.timeService.startTimer(this.gameData.timePerQuestion, () => {
            this.timeService.stopTimer(this.timerId);
            this.answerConfirmed = false;
            this.currentQuestionIndex++;
            this.loadNextQuestion();
        });
    }

    confirmAnswer(): void {
        this.answerConfirmed = true;
    }
}
