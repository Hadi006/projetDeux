import { Component } from '@angular/core';
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
export class GameChoicePageComponent {
    quizzes: Quiz[] = [];

    chosenGame: string | null = null;

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

    chooseGame(game: string) {
        this.chosenGame = game;
    }

    previewQuestions() {
        if (this.chosenGame) {
            this.router.navigate(['/questions', this.chosenGame]);
        }
    }

    startGame() {
        this.gameHandlerService.loadGameData();
        this.router.navigate(['lobby']);
    }

    testGame() {
        if (this.chosenGame) {
            this.gameHandlerService.loadGameData();
            this.router.navigate(['/play']);
        }
    }
}
