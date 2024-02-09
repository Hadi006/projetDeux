import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
    selector: 'app-questions',
    templateUrl: './questions-page.component.html',
    styleUrls: ['./questions-page.component.scss'],
})
export class QuestionsPageComponent implements OnInit {
    game: string | null = null;
    questions: string[] = [];
    description: string = '';
    selectedQuestion: string | null = null;

    constructor(
        private route: ActivatedRoute,
        private router: Router,
    ) {}

    toggleQuestion(question: string, event: MouseEvent) {
        const target = event.currentTarget as HTMLElement;

        // Check if the clicked question is already selected
        if (this.selectedQuestion === question) {
            // Unselect the question and remove the 'selected' class
            this.selectedQuestion = null;
            target.classList.remove('selected');
        } else {
            // Select the new question and add the 'selected' class, while removing it from any previously selected question
            if (this.selectedQuestion) {
                document.querySelector('.selected')?.classList.remove('selected');
            }
            this.selectedQuestion = question;
            target.classList.add('selected');
        }
    }

    ngOnInit(): void {
        this.game = this.route.snapshot.paramMap.get('game');

        switch (this.game) {
            case 'Math':
                this.questions = ['1+1', '1x1', '1-1', '5x2', '1-4', '6/2'];
                break;
            case 'Science':
                this.questions = [
                    'Unité de base de la vie',
                    'Gaz le plus abondant dans latmosphère terrestre',
                    'La plus grande planète de notre système solaire',
                    'La photosynthèse',
                ];
                break;
            case 'Programmation':
                this.questions = [
                    'boucle "for" en programmation',
                    'Différence entre HTML et CSS',
                    'Fonction en programmation',
                    'But principal de SQL',
                    'En programmation orientée objet, que représente une classe',
                ];
                break;
            case 'Histoire':
                this.questions = [
                    'Le premier empereur de Rome',
                    'La principale cause de la Première Guerre mondiale',
                    'Événement qui a marqué le début de la Révolution française',
                ];
                break;
            case 'Physique':
                this.questions = [
                    'Quelle est la vitesse de la lumière',
                    'Qui a découvert la loi de la gravitation universelle',
                    'Quelle est la première loi du mouvement de Newton',
                    'Quel est le principe de incertitude de Heisenberg',
                ];
                break;
            default:
                this.questions = [];
                break;
        }
    }

    goBack() {
        this.router.navigate(['game']);
    }

    startGame() {
        this.router.navigate(['game-start']);
    }
}
