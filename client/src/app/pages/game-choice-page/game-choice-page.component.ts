import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
    selector: 'app-choix-jeu',
    templateUrl: './game-choice-page.component.html',
    styleUrls: ['./game-choice-page.component.scss'],
})
export class GameChoicePageComponent {
    games = ['Math', 'Science', 'Programmation', 'Histoire', 'Physique', 'Mode aleatoire'];

    chosenGame: string | null = null;

    constructor(private router: Router) {}

    chooseGame(game: string) {
        this.chosenGame = game;
    }

    createGame() {
        if (this.chosenGame) {
            // Navigue vers la page de création du jeu sélectionné
            this.router.navigate(['/questions', this.chosenGame]);
        }
    }

    testGame() {
        if (this.chosenGame) {
            this.router.navigate(['/test', this.chosenGame]);
        }
    }
}
