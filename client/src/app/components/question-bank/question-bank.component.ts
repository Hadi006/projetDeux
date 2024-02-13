import { CdkDragDrop } from '@angular/cdk/drag-drop';
import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { AlertComponent } from '@app/components/alert/alert.component';
import { QuestionFormComponent } from '@app/components/question-form/question-form.component';
import { AdminQuizzesService } from '@app/services/admin-quizzes.service';
import { INVALID_INDEX } from '@common/constant';
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
        private admin: AdminQuizzesService,
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

    drop(event: CdkDragDrop<Question[] | null>) {
        if (event.container.data === null || event.previousContainer.data === null || event.previousContainer === event.container) {
            return;
        }

        const newQuestion: Question = event.previousContainer.data[event.previousIndex];

        this.questionBank.addQuestion(newQuestion).subscribe((error: string) => {
            if (error) {
                this.dialog.open(AlertComponent, { data: { message: error } });
            }
        });
    }

    openQuestionForm(index?: number) {
        const isNewQuestion = index === undefined;
        const question = this.questionBank.getQuestion(isNewQuestion ? INVALID_INDEX : index);
        this.admin.selectedQuestion = question;

        const questionFormRef = this.dialog.open(QuestionFormComponent, {
            width: '80%',
            height: '80%',
        });

        questionFormRef.afterClosed().subscribe((editedQuestion?: Question) => {
            if (editedQuestion) {
                this.processQuestion(editedQuestion, isNewQuestion);
            }
        });
    }

    private processQuestion(question: Question, isNew: boolean) {
        const operation = isNew ? this.questionBank.addQuestion(question) : this.questionBank.updateQuestion(question);

        operation.subscribe((error: string) => {
            if (error) {
                this.dialog.open(AlertComponent, { data: { message: error } });
            }
        });
    }
}
