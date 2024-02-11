import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { GameHandlerService } from '@app/services/game-handler.service';
import { PublicQuizzesService } from '@app/services/public-quizzes.service';

@Component({
    selector: 'app-game-choice-page',
    templateUrl: './game-choice-page.component.html',
    styleUrls: ['./game-choice-page.component.scss'],
})
export class GameChoicePageComponent {
    games = ['Math', 'Science', 'Programmation', 'Histoire', 'Mode aleatoire'];

    chosenGame: string | null = null;

    constructor(
        private publicQuizzesService: PublicQuizzesService,
        private router: Router,
        private gameHandlerService: GameHandlerService,
    ) {}

    chooseGame(game: string) {
        this.chosenGame = game;
    }

    previewQuestions() {
        if (this.chosenGame) {
            this.router.navigate(['/questions', this.chosenGame]);
        }
    }

    startGame() {
        this.gameHandlerService.loadGameData();
        this.router.navigate(['lobby']);
    }

    testGame() {
        if (this.chosenGame) {
            this.gameHandlerService.loadGameData();
            this.router.navigate(['/play']);
        }
    }
}
