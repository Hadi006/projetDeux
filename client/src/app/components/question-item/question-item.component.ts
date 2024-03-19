import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Action, ActionType } from '@common/action';
import { Question } from '@common/quiz';

@Component({
    selector: 'app-question-item',
    templateUrl: './question-item.component.html',
    styleUrls: ['./question-item.component.scss'],
})
export class QuestionItemComponent {
    @Input() question: Question;
    @Input() index: number;
    @Output() action: EventEmitter<Action> = new EventEmitter();

    displayDate: boolean = false;

    constructor(private route: ActivatedRoute) {
        if (this.joinUrl() === 'home/admin/quizzes') {
            this.displayDate = true;
        }
    }

    onAction(actionType: string) {
        this.action.emit({ type: actionType as ActionType, target: this.index });
    }

    private joinUrl(): string {
        return this.route.snapshot.url.join('/');
    }
}
