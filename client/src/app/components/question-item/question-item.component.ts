import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Question } from '@common/quiz';

@Component({
    selector: 'app-question-item',
    templateUrl: './question-item.component.html',
    styleUrls: ['./question-item.component.scss'],
})
export class QuestionItemComponent {
    @Input() question: Question;
    @Input() index: number;
    @Output() action: EventEmitter<{ type: string; questionIndex: number }> = new EventEmitter();

    displayDate: boolean = false;

    constructor(private route: ActivatedRoute) {
        const URL = this.route.snapshot.url.join('/');
        if (URL === 'home/admin/quizzes') {
            this.displayDate = true;
        }
    }

    onAction(actionType: string) {
        this.action.emit({ type: actionType, questionIndex: this.index });
    }
}
