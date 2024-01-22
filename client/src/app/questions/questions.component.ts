import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-questions',
  templateUrl: './questions.component.html',
  styleUrls: ['./questions.component.scss']
})
export class QuestionsComponent implements OnInit {
  jeu: string | null = null;
  questions: string[]; // Utilisez un type plus spécifique si nécessaire

  constructor(private route: ActivatedRoute, private router: Router) {}


  ngOnInit(): void {
    this.jeu = this.route.snapshot.paramMap.get('jeu');

    // Vous pourriez avoir une structure conditionnelle ou un service pour charger les questions
    if (this.jeu === 'Math') {
      this.questions = [
        '1+1',
        '1x1',
        '1-1',
        '5x2',
        '1-4',
        '6/2'
        
      ];
    } else if (this.jeu === 'Science') {
      this.questions = [
        // ...questions de science...
        'Unité de base de la vie',
        'Gaz est le plus abondant dans le atmosphère terrestre',
        'La plus grande planète de notre système solaire',
        'La photosynthèse',
      ];
    } else if (this.jeu === 'Programmation') {
      this.questions = [
        
        'boucle "for" en programmation',
        'Différence entre HTML et CSS',
        'Fonction en programmation',
        'le but principal de SQL',
        'En programmation orientée objet, que représente une classe',




      ];

    } else if (this.jeu === 'Histoire') {
      this.questions = [
        'Le premier empereur de Rome',
        ' la principale cause de la Première Guerre mondiale',
        'Événement a marqué le début de la Révolution française',
        
      ];

    } else if (this.jeu === 'Physique') {
      this.questions = [

        'Quelle est la vitesse de la lumière',
        'Qui a découvert la loi de la gravitation universelle',
        'Quelle est la première loi du mouvement de Newton',
        'Quel est le principe de incertitude de Heisenberg',


      ];  
    }

  }



  goBack() {
    this.router.navigate(['choix-jeu']);
  }

  confirmQuestions() {
    // Implémentez la logique pour confirmer la sélection des questions
  }
}