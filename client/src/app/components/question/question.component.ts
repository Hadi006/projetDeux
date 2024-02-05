import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
    selector: 'app-question',
    templateUrl: './question.component.html',
    styleUrls: ['./question.component.scss'],
})
export class QuestionComponent {
    @Input() question: string | null = null;
    @Output() selectedQuestion = new EventEmitter<string | null>();
    isSelected: boolean = false;

    selectQuestion() {
        this.selectedQuestion.emit(this.question);
        this.isSelected = true;
    }
}
