import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { HostService } from '@app/services/host/host.service';
import { PublicQuizzesService } from '@app/services/public-quizzes/public-quizzes.service';
import { Quiz } from '@common/quiz';
import { Observable, map, of, take } from 'rxjs';

@Component({
    selector: 'app-game-choice-page',
    templateUrl: './game-choice-page.component.html',
    styleUrls: ['./game-choice-page.component.scss'],
})
export class GameChoicePageComponent implements OnInit {
    chosenQuiz: Quiz | null = null;

    constructor(
        private publicQuizzesService: PublicQuizzesService,
        private router: Router,
        private hostService: HostService,
    ) {}

    ngOnInit() {
        this.publicQuizzesService.fetchVisibleQuizzes().subscribe();
    }

    getQuizzes(): Quiz[] {
        return this.publicQuizzesService.quizzes;
    }

    chooseQuiz(quiz: Quiz) {
        this.chosenQuiz = quiz;
    }

    startGame() {
        this.publicQuizzesService
            .checkQuizAvailability(this.chosenQuiz?.id)
            .pipe(take(1))
            .subscribe((isAvailable) => {
                this.handleChosenQuiz(isAvailable).subscribe((success: boolean) => {
                    if (success) {
                        this.router.navigate(['waiting-room-host']);
                    } else {
                        this.hostService.cleanUp();
                    }
                });
            });
    }

    testGame() {
        this.publicQuizzesService
            .checkQuizAvailability(this.chosenQuiz?.id)
            .pipe(take(1))
            .subscribe((isAvailable) => {
                this.handleChosenQuiz(isAvailable).subscribe((success) => {
                    if (success) {
                        this.router.navigate(['test']);
                    } else {
                        this.hostService.cleanUp();
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

        this.hostService.handleSockets();
        return this.hostService.createGame(this.chosenQuiz).pipe(
            map((success: boolean) => {
                if (!success) {
                    this.publicQuizzesService.alertNoQuizAvailable('Erreur lors de la création du jeu');
                }
                return success;
            }),
        );
    }
}
