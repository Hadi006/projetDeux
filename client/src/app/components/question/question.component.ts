import { Component, HostListener, Input, OnDestroy } from '@angular/core';
import { QuestionData } from '@common/question-data';
import { Player } from '@app/interfaces/player';
import { QuestionHandlerService } from '@app/services/question-handler.service';
import { Subscription } from 'rxjs';

@Component({
    selector: 'app-question',
    templateUrl: './question.component.html',
    styleUrls: ['./question.component.scss'],
})
export class QuestionComponent implements OnDestroy {
    @Input() answerConfirmed: boolean;
    @Input() showingAnswer: boolean;
    @Input() player: Player;

    private questionsSubscription: Subscription;
    private questionData: QuestionData;
    private isChecked: boolean[];

    constructor(private questionHandlerService: QuestionHandlerService) {
        this.questionsSubscription = this.questionHandlerService.questions.subscribe((questionData: QuestionData | undefined) => {
            if (!questionData) {
                return;
            }

            this.setQuestion(questionData);
        });
    }

    @HostListener('window:keyup', ['$event'])
    handleKeyUp(event: KeyboardEvent): void {
        if (!this.questionData || !this.questionData.isMCQ || !this.canEditAnswer()) {
            return;
        }

        event.stopPropagation();
        if (event.key === 'Enter') {
            this.confirmAnswer();
        }

        const key = parseInt(event.key, 10) - 1;
        if (key >= 0 && key < this.questionData.answers.length) {
            this.isChecked[key] = !this.isChecked[key];
        }
    }

    canEditAnswer(): boolean {
        return !this.answerConfirmed && !this.showingAnswer;
    }

    ngOnDestroy(): void {
        this.questionsSubscription.unsubscribe();
    }

    private setQuestion(data: QuestionData) {
        this.questionData = data;
        this.isChecked = new Array(this.questionData.answers.length).fill(false);
        this.answerConfirmed = false;
    }

    private confirmAnswer(): void {
        this.answerConfirmed = true;
        this.player.answerNotifier.next(this.isChecked);
    }
}
