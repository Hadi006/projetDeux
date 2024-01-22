

import { Component } from '@angular/core';
import { Router } from '@angular/router';

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

  constructor(private router: Router)  {}

  // Méthode pour gérer la sélection d'un jeu
  choisirJeu(jeu: string) {
    this.jeuSelectionne = jeu;
    console.log(`Jeu choisi: ${jeu}`);
  }

  goBack() {
    
    console.log('Retour');
    this.router.navigate(['']);
    
    
  }

  goNext() {
    if (this.jeuSelectionne) {
      this.router.navigate(['/questions', this.jeuSelectionne]);
    }
  }
    
  }

  
