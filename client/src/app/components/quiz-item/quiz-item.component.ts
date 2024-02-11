import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Quiz } from '@common/quiz';

@Component({
    selector: 'app-quiz-item',
    templateUrl: './quiz-item.component.html',
    styleUrls: ['./quiz-item.component.scss'],
})
export class QuizItemComponent {
    @Input() index: number;
    @Input() quiz: Quiz;
    @Output() action: EventEmitter<{ type: string; quizIndex: number }> = new EventEmitter();

    onAction(actionType: string) {
        this.action.emit({ type: actionType, quizIndex: this.index });
    }
}
