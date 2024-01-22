

import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-choix-jeu',
  templateUrl: './game-choice-page.component.html',
  styleUrls: ['./game-choice-page.component.scss']
})
export class GameChoicePageComponent {
  // Liste des jeux disponibles
  jeux = ['Math', 'Science', 'Programmation', 'Histoire', 'Physique', 'Random mode'];

  // Jeu sélectionné
  chosenGame: string | null = null;

  constructor(private router: Router)  {}

  // Méthode pour gérer la sélection d'un jeu
  choisirJeu(jeu: string) {
    this.chosenGame = jeu;
    console.log(`Jeu choisi: ${jeu}`);
  }

  goBack() {
    
    console.log('Retour');
    this.router.navigate(['']);

    
  }

  goNext() {
    if (this.chosenGame) {
      this.router.navigate(['/questions', this.chosenGame]);
    }
  }
    
  }

  
