import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
    selector: 'app-questions',
    templateUrl: './questions-page.component.html',
    styleUrls: ['./questions-page.component.scss'],
})
export class QuestionsPageComponent implements OnInit {
    jeu: string | null = null;
    questions: string[];
    description: string;
    selectedQuestion: string | null = null;

    constructor(
        private route: ActivatedRoute,
        private router: Router,
    ) {}

    selectQuestion(question: string, event: any) {
        this.selectedQuestion = question;
        event.currentTarget.classList.add('selected');
    }

    ngOnInit(): void {
        this.jeu = this.route.snapshot.paramMap.get('jeu');

        if (this.jeu === 'Math') {
            this.questions = ['1+1', '1x1', '1-1', '5x2', '1-4', '6/2'];
        } else if (this.jeu === 'Science') {
            this.questions = [
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
        this.router.navigate(['game']);
    }

    startGame() {}
}
