import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { GameHandlerService } from '@app/services/game-handler.service';
import { PublicQuizzesService } from '@app/services/public-quizzes.service';
import { Quiz } from '@common/quiz';

@Component({
    selector: 'app-game-choice-page',
    templateUrl: './game-choice-page.component.html',
    styleUrls: ['./game-choice-page.component.scss'],
})
export class GameChoicePageComponent implements OnInit {
    chosenQuiz: Quiz | null = null;

    constructor(
        public publicQuizzesService: PublicQuizzesService,
        private router: Router,
        private gameHandlerService: GameHandlerService,
    ) {}

    ngOnInit() {
        this.publicQuizzesService.fetchVisibleQuizzes().subscribe();
    }

    chooseQuiz(quiz: Quiz) {
        this.chosenQuiz = quiz;
    }

    startGame() {
        this.publicQuizzesService.checkQuizAvailability().subscribe((isAvailable) => {
            if (!this.chosenQuiz) {
                this.publicQuizzesService.alertNoQuizAvailable('Aucun quiz sélectionné');
                return;
            }

            if (!isAvailable) {
                this.publicQuizzesService.alertNoQuizAvailable('Quiz non disponible');
                this.chosenQuiz = null;
                return;
            }

            this.gameHandlerService.loadQuizData(this.chosenQuiz);
            this.router.navigate(['lobby']);
        });
    }

    testGame() {
        this.publicQuizzesService.checkQuizAvailability().subscribe((isAvailable) => {
            if (!this.chosenQuiz) {
                this.publicQuizzesService.alertNoQuizAvailable('Aucun quiz sélectionné');
                return;
            }

            if (!isAvailable) {
                this.publicQuizzesService.alertNoQuizAvailable('Quiz non disponible');
                this.chosenQuiz = null;
                return;
            }

            this.gameHandlerService.loadQuizData(this.chosenQuiz);
            this.router.navigate(['/play']);
        });
    }
}
