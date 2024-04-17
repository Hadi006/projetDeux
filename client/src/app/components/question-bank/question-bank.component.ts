import { CdkDragDrop } from '@angular/cdk/drag-drop';
import { Component, OnInit } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { AlertComponent } from '@app/components/alert/alert.component';
import { QuestionFormComponent } from '@app/components/question-form/question-form.component';
import { AdminQuizzesService } from '@app/services/admin-quizzes/admin-quizzes.service';
import { QuestionBankService } from '@app/services/question-bank/question-bank.service';
import { Action, ActionType } from '@common/action';
import { INVALID_INDEX } from '@common/constant';
import { Question } from '@common/quiz';
import { Observable, map, take } from 'rxjs';

@Component({
    selector: 'app-question-bank',
    templateUrl: './question-bank.component.html',
    styleUrls: ['./question-bank.component.scss'],
})
export class QuestionBankComponent implements OnInit {
    questions: Observable<Question[]>;
    filteredQuestions: Observable<Question[]>;
    selectedType: string = '';

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
        this.filterQuestions();

        this.questionBank.fetchQuestions();
    }

    filterQuestions(): void {
        if (this.selectedType) {
            this.filteredQuestions = this.questions.pipe(map((questions) => questions.filter((question) => question.type === this.selectedType)));
        } else {
            this.filteredQuestions = this.questions;
        }
    }

    handle(action: Action) {
        switch (action.type) {
            case ActionType.EDIT:
                this.openQuestionForm(action.target);
                break;
            case ActionType.DELETE:
                this.questionBank.deleteQuestion(action.target);
                break;
            default:
                break;
        }
    }

    drop(event: CdkDragDrop<Question[] | null>) {
        const newQuestion = this.getQuestionFromContainer(event);
        if (!newQuestion) {
            return;
        }

        this.questionBank
            .addQuestion(newQuestion)
            .pipe(take(1))
            .subscribe((error: string) => {
                if (error) {
                    this.dialog.open(AlertComponent, { data: { message: error } });
                }
            });
    }

    openQuestionForm(index?: number) {
        const isNewQuestion = index === undefined;
        const question = this.questionBank.getQuestion(isNewQuestion ? INVALID_INDEX : index);
        this.admin.selectedQuestion = question;

        this.openQuestionFormRef()
            .afterClosed()
            .pipe(take(1))
            .subscribe((editedQuestion?: Question) => {
                if (editedQuestion) {
                    this.processQuestion(editedQuestion, isNewQuestion);
                }
            });
    }

    private processQuestion(question: Question, isNew: boolean) {
        this.submitQuestionChange(question, isNew)
            .pipe(take(1))
            .subscribe((error: string) => {
                if (error) {
                    this.dialog.open(AlertComponent, { data: { message: error } });
                }
            });
    }

    private openQuestionFormRef(): MatDialogRef<QuestionFormComponent> {
        return this.dialog.open(QuestionFormComponent, {
            width: '80%',
            height: '80%',
        });
    }

    private submitQuestionChange(question: Question, isNew: boolean): Observable<string> {
        return isNew ? this.questionBank.addQuestion(question) : this.questionBank.updateQuestion(question);
    }

    private getQuestionFromContainer(event: CdkDragDrop<Question[] | null>): Question | null {
        if (!event.container.data || !event.previousContainer.data || event.previousContainer === event.container) {
            return null;
        }

        return event.previousContainer.data[event.previousIndex];
    }
}
