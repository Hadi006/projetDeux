import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';

interface GameInfo {
    description: string;
    duration: string;
    questions: string[];
}

interface Games {
    [key: string]: GameInfo;
}

@Component({
    selector: 'app-description-panel',
    templateUrl: './description-panel.component.html',
    styleUrls: ['./description-panel.component.scss'],
})
export class DescriptionPanelComponent implements OnChanges {
    @Input() selectedGame: string | null = null;
    description: string = '';
    duration: string = '';
    questions: string[] = [];
    gamesInfo: Games = {
        math: {
            description: 'Une série de questions sur les mathématiques.',
            duration: '30 secondes par question',
            questions: ['1+1', '1x1', '1-1'],
        },
        science: {
            description: 'Explorez les mystères de la science.',
            duration: '45 secondes par question',
            questions: ['Quelle est la base de la vie?', "Quel gaz est le plus abondant dans l'atmosphère terrestre?"],
        },
        programmation: {
            description: 'Une série de questions sur les mathématiques.',
            duration: '30 secondes par question',
            questions: ['1+1', '1x1', '1-1'],
        },
        histoire: {
            description: 'Explorez les mystères de la science.',
            duration: '45 secondes par question',
            questions: ['Quelle est la base de la vie?', "Quel gaz est le plus abondant dans l'atmosphère terrestre?"],
        },
    };

    ngOnChanges(changes: SimpleChanges): void {
        if (changes['selectedGame']) {
            this.updateGameInfo(this.selectedGame);
        }
    }

    private updateGameInfo(game: string | null) {
        if (game && this.gamesInfo[game]) {
            const gameInfo = this.gamesInfo[game];
            this.description = gameInfo.description;
            this.duration = gameInfo.duration;
            this.questions = gameInfo.questions;
        } else {
            this.description = 'Sélectionnez un jeu pour voir sa description, sa durée et ses questions.';
            this.duration = '';
            this.questions = [];
        }
    }
}
