// import { Component } from '@angular/core';

// @Component({
//   selector: 'app-choix-jeu',
//   templateUrl: './choix-jeu.component.html',
//   styleUrls: ['./choix-jeu.component.scss']
// })
// export class ChoixJeuComponent {

//}

import { Component } from '@angular/core';

@Component({
  selector: 'app-choix-jeu',
  templateUrl: './choix-jeu.component.html',
  styleUrls: ['./choix-jeu.component.scss']
})
export class ChoixJeuComponent {
  // Liste des jeux disponibles
  jeux = ['Math', 'Science', 'Programmation', 'Histoire', 'Physique'];

  // Jeu sélectionné
  jeuSelectionne: string | null = null;

  constructor() {}

  // Méthode pour gérer la sélection d'un jeu
  choisirJeu(jeu: string) {
    this.jeuSelectionne = jeu;
    console.log(`Jeu choisi: ${jeu}`);
    
  }
}