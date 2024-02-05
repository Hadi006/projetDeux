import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
    selector: 'app-choix-jeu',
    templateUrl: './game-choice-page.component.html',
    styleUrls: ['./game-choice-page.component.scss'],
})
export class GameChoicePageComponent {
    // Liste des jeux disponibles
    jeux = ['Math', 'Science', 'Programmation', 'Histoire', 'Physique', 'Random mode'];

    // Jeu sélectionné
    chosenGame: string | null = null;

    constructor(private router: Router) {}

    // Méthode pour gérer la sélection d'un jeu
    choisirJeu(jeu: string) {
        this.chosenGame = jeu;
    }

    createGame() {
        if (this.chosenGame) {
            // Navigue vers la page de création du jeu sélectionné
            this.router.navigate(['/questions', this.chosenGame]);
        }
    }

    testGame() {
        if (this.chosenGame) {
            // Navigue vers la page de test du jeu sélectionné
            // Assurez-vous que la route 'test/:jeu' est configurée dans votre module de routage
            this.router.navigate(['/test', this.chosenGame]);
        }
    }
}
