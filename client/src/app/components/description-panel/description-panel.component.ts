import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { Question, Quiz } from '@common/quiz';

@Component({
    selector: 'app-description-panel',
    templateUrl: './description-panel.component.html',
    styleUrls: ['./description-panel.component.scss'],
})
export class DescriptionPanelComponent implements OnChanges {
    @Input() selectedQuiz: Quiz | null = null;
    description: string = '';
    duration: string = '';
    questions: Question[] = [];

    ngOnChanges(changes: SimpleChanges): void {
        if (changes.selectedGame) {
            this.updateGameInfo(this.selectedQuiz);
        }
    }

    private updateGameInfo(quiz: Quiz | null) {
        if (quiz) {
            this.description = quiz.description;
            this.duration = quiz.duration.toString() + ' seconds';
            this.questions = quiz.questions;
        } else {
            this.description = 'Sélectionnez un jeu pour voir sa description, sa durée et ses questions.';
            this.duration = '';
            this.questions = [];
        }
    }
}
