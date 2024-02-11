import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { GameHandlerService } from '@app/services/game-handler.service';
import { PublicQuizzesService } from '@app/services/public-quizzes.service';
import { Quiz } from '@common/quiz';
import { Subscription } from 'rxjs';

@Component({
    selector: 'app-game-choice-page',
    templateUrl: './game-choice-page.component.html',
    styleUrls: ['./game-choice-page.component.scss'],
})
export class GameChoicePageComponent implements OnInit,OnDestroy {
    quizzes: Quiz[] = [];

    chosenQuiz: Quiz;

    private quizzesSubscription: Subscription;

    constructor(
        private publicQuizzesService: PublicQuizzesService,
        private router: Router,
        private gameHandlerService: GameHandlerService,
    ) {
        this.quizzesSubscription = this.publicQuizzesService.quizzes$.subscribe((quizzes) => {
            this.quizzes = quizzes;
        });
    }

    ngOnInit() {
        this.publicQuizzesService.fetchVisibleQuizzes();
    }

    chooseQuiz(quiz: Quiz) {
        this.chosenQuiz = quiz;
    }

    startGame() {
        if (!this.chosenQuiz) {
            return;
        }
        this.gameHandlerService.loadGameData();
        this.router.navigate(['lobby']);
    }

    testGame() {
        if (!this.chosenQuiz) {
            return;
        }
        this.gameHandlerService.loadGameData();
        this.router.navigate(['/play']);
    }

    ngOnDestroy() {
        this.quizzesSubscription.unsubscribe();
    }
}
