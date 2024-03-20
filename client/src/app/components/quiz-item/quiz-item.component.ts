import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Action, ActionType } from '@common/action';
import { Quiz } from '@common/quiz';

@Component({
    selector: 'app-quiz-item',
    templateUrl: './quiz-item.component.html',
    styleUrls: ['./quiz-item.component.scss'],
})
export class QuizItemComponent {
    @Input() index: number;
    @Input() quiz: Quiz;
    @Output() action: EventEmitter<Action> = new EventEmitter();

    onAction(actionType: string) {
        this.action.emit({ type: actionType as ActionType, target: this.index });
    }
}
