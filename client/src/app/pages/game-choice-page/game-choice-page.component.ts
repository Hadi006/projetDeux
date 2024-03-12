import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { HostService } from '@app/services/host.service';
import { PublicQuizzesService } from '@app/services/public-quizzes.service';
import { Quiz } from '@common/quiz';
import { map, Observable, of } from 'rxjs';

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
        private hostService: HostService,
    ) {}

    ngOnInit() {
        this.publicQuizzesService.fetchVisibleQuizzes().subscribe();
    }

    chooseQuiz(quiz: Quiz) {
        this.chosenQuiz = quiz;
    }

    startGame() {
        this.publicQuizzesService.checkQuizAvailability().subscribe((isAvailable) => {
            this.handleChosenQuiz(isAvailable).subscribe((success: boolean) => {
                if (success) {
                    this.router.navigate(['lobby']);
                }
            });
        });
    }

    testGame() {
        this.publicQuizzesService.checkQuizAvailability().subscribe((isAvailable) => {
            this.handleChosenQuiz(isAvailable).subscribe((success) => {
                if (success) {
                    this.router.navigate(['test']);
                }
            });
        });
    }

    private handleChosenQuiz(isAvailable: boolean): Observable<boolean> {
        if (!this.chosenQuiz) {
            this.publicQuizzesService.alertNoQuizAvailable('Aucun quiz sélectionné');
            return of(false);
        }

        if (!isAvailable) {
            this.publicQuizzesService.alertNoQuizAvailable('Quiz non disponible, veuillez en choisir un autre');
            this.chosenQuiz = null;
            return of(false);
        }

        this.hostService.connect();
        return this.hostService.createLobby(this.chosenQuiz).pipe(
            map((success: boolean) => {
                if (!success) {
                    this.publicQuizzesService.alertNoQuizAvailable('Nombre maximum de jeux atteint');
                }
                return success;
            }),
        );
    }
}
