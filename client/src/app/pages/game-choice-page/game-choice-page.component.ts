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
            if (!this.handleChosenQuiz(isAvailable)) {
                return;
            }

            this.router.navigate(['lobby']);
        });
    }

    testGame() {
        this.publicQuizzesService.checkQuizAvailability().subscribe((isAvailable) => {
            if (!this.handleChosenQuiz(isAvailable)) {
                return;
            }

            this.router.navigate(['/play']);
        });
    }

    private handleChosenQuiz(isAvailable: boolean): boolean {
        if (!this.chosenQuiz) {
            this.publicQuizzesService.alertNoQuizAvailable('Aucun quiz sélectionné');
            return false;
        }

        if (!isAvailable) {
            this.publicQuizzesService.alertNoQuizAvailable('Quiz non disponible, veuillez en choisir un autre');
            this.chosenQuiz = null;
            return false;
        }

        this.gameHandlerService.loadQuizData(this.chosenQuiz);
        return true;
    }
}
