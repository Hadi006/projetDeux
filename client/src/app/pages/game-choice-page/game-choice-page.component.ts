import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
    selector: 'app-game-choice-page',
    templateUrl: './game-choice-page.component.html',
    styleUrls: ['./game-choice-page.component.scss'],
})
export class GameChoicePageComponent {
    games = ['Math', 'Science', 'Programmation', 'Histoire', 'Mode aleatoire'];

    chosenGame: string | null = null;

    constructor(private router: Router) {}

    chooseGame(game: string) {
        this.chosenGame = game;
    }

    previewQuestions() {
        if (this.chosenGame) {
            this.router.navigate(['/questions', this.chosenGame]);
        }
    }

    startGame() {
        this.router.navigate(['game-start']);
    }

    testGame() {
        if (this.chosenGame) {
            this.router.navigate(['/test', this.chosenGame]);
        }
    }
}
