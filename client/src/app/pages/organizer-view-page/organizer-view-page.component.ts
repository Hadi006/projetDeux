import { Component, OnDestroy, OnInit } from '@angular/core';
import { ChatboxComponent } from '@app/components/chatbox/chatbox.component';
import { PLAYERS_TEST } from '@common/constant';
import { Player } from '@common/player';
import { Quiz } from '@common/quiz';
import { QUIZ_TEST_1 } from '@common/quiz-test';

@Component({
    selector: 'app-organizer-view-page',
    templateUrl: './organizer-view-page.component.html',
    styleUrls: ['./organizer-view-page.component.scss'],
})
export class OrganizerViewPageComponent implements OnInit, OnDestroy {
    gameData: Quiz;
    chatBox: ChatboxComponent;
    allPlayerSubmitted: boolean = false;
    playerList: Player[] = [];
    currentAnswerIndex = 0;
    playerScores = new Map<string, number>();
    currentQuestionIndex = 0;
    showNextQuestionButton: boolean = true;

    get time(): number {
        return 0;
    }

    ngOnInit(): void {
        this.loadGameData();
        this.loadHistogramStatus();
        this.gameData = QUIZ_TEST_1;
        this.playerList = PLAYERS_TEST;
        this.allPlayerSubmitted = this.playerList[0].answerConfirmed && this.playerList[1].answerConfirmed;
        // this.startGameTime = this.datePipe.transform(new Date(), 'yyyy-MM-dd hh:mm:ss')?.toString();
    }

    ngOnDestroy(): void {
        return;
    }

    /**
     * Charge les données du jeu à partir du service de jeu.
     */
    loadGameData(): void {
        return;
    }

    /**
     * Charge le statut de l'histogramme en fonction du type de question actuel.
     */
    loadHistogramStatus(): void {
        return;
    }

    /**
     * Déplace les joueurs vers la question suivante une fois que tous les joueurs ont soumis leurs réponses.
     */
    movePlayerToNextQuestion(): void {
        this.currentQuestionIndex++;
        this.updatePlayerScore();
    }

    /**
     * Vérifie si la réponse sélectionnée par l'utilisateur est correcte.
     * @param i - L'indice de la réponse dans la liste des choix de la question actuelle.
     * @returns true si la réponse est correcte, sinon false.
     */
    // checkGoodChoice(i: number): boolean {
    //     this.x = i;
    //     return true;
    // }

    /**
     * Met à jour le score du joueur en fonction de l'événement de changement de score.
     * @param playerName - Le nom du joueur dont le score doit être mis à jour.
     * @param event - L'événement de changement de score.
     * Je veux faire une interface "player" qui contient l'attribut playerName
     */
    updatePlayerScore(): void {
        let j = 0;
        for (const player of this.playerList) {
            if (player.questions[j].choices[j].isCorrect) {
                player.score += this.gameData.questions[j].points;
            }
            j++;
        }
    }

    /**
     * Envoie les scores des joueurs au serveur.
     */
    sendScoresToServer(): void {
        return;
    }

    /**
     * Bascule l'état du minuteur entre la pause et la reprise.
     */
    toggleTimer(): void {
        return;
    }

    /**
     * Met en pause le minuteur.
     */
    pauseTimer(): void {
        return;
    }

    /**
     * Vérifie si le minuteur est en cours d'exécution.
     * @returns true si le minuteur est en cours d'exécution, sinon false.
     */
    isTimeRunning(): boolean {
        return true;
    }

    // pour la zone de clavardage je veux utiliser le component du ceren et miakel
    // alors ya pas des fonctions pour ce feauture
}
