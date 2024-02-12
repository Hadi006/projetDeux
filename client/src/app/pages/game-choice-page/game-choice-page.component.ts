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
    chosenQuiz: Quiz;

    constructor(
        public publicQuizzesService: PublicQuizzesService,
        private router: Router,
        private gameHandlerService: GameHandlerService,
    ) {}

    ngOnInit() {
        this.publicQuizzesService.fetchVisibleQuizzes();
    }

    chooseQuiz(quiz: Quiz) {
        this.chosenQuiz = quiz;
    }

    startGame() {
        if (!this.checkQuizAvailability()) {
            return;
        }
        this.gameHandlerService.loadQuizData(this.chosenQuiz);
        this.router.navigate(['lobby']);
    }

    testGame() {
        if (!this.checkQuizAvailability()) {
            return;
        }

        this.gameHandlerService.loadQuizData(this.chosenQuiz);
        this.router.navigate(['/play']);
    }

    private checkQuizAvailability(): boolean {
        if (!this.chosenQuiz) {
            return false;
        }

        this.publicQuizzesService.fetchVisibleQuizzes();

        if (this.quizzes.find((quiz) => quiz.id === this.chosenQuiz.id)) {
            return true;
        }

        return false;
    }
}
