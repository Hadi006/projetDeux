import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { AdminService } from '@app/services/admin.service';
import { Question } from '@common/quiz';
import { Observable, map } from 'rxjs';
import { QuestionBankService } from 'src/app/services/question-bank.service';

@Component({
    selector: 'app-question-bank',
    templateUrl: './question-bank.component.html',
    styleUrls: ['./question-bank.component.scss'],
})
export class QuestionBankComponent implements OnInit {
    questions: Observable<Question[]>;

    constructor(
        private questionBank: QuestionBankService,
        private dialog: MatDialog,
        private admin: AdminService,
    ) {}

    ngOnInit() {
        this.questions = this.questionBank.questions$.pipe(
            map((questions) =>
                questions.sort((a, b) => {
                    const dateA = new Date(a.lastModification || 0);
                    const dateB = new Date(b.lastModification || 0);
                    return dateA.getTime() - dateB.getTime();
                }),
            ),
        );

        this.questionBank.fetchQuestions();
    }

    handle(action: { type: string; questionIndex: number }) {
        switch (action.type) {
            case 'edit':
                this.openQuestionForm(action.questionIndex);
                break;
            case 'delete':
                this.questionBank.deleteQuestion(action.questionIndex);
                break;
            default:
                break;
        }
    }
}