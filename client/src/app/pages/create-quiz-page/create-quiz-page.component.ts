import { CdkDragDrop, copyArrayItem, moveItemInArray } from '@angular/cdk/drag-drop';
import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { AlertComponent } from '@app/components/alert/alert.component';
import { QuestionFormComponent } from '@app/components/question-form/question-form.component';
import { AdminQuizzesService } from '@app/services/admin-quizzes.service';
import { Action, ActionType } from '@common/action';
import { BLANK_QUESTION } from '@common/constant';
import { Question, Quiz } from '@common/quiz';
import { ValidationResult } from '@common/validation-result';
import { Observable } from 'rxjs';
import { take } from 'rxjs/operators';

@Component({
    selector: 'app-create-quiz-page',
    templateUrl: './create-quiz-page.component.html',
    styleUrls: ['./create-quiz-page.component.scss'],
})
export class CreateQuizPageComponent implements OnInit {
    quiz: Quiz;

    constructor(
        private adminService: AdminQuizzesService,
        private router: Router,
        private dialog: MatDialog,
    ) {}

    ngOnInit() {
        this.quiz = this.adminService.getSelectedQuiz();
    }

    handle(action: Action) {
        switch (action.type) {
            case ActionType.EDIT:
                this.openQuestionForm(action.target);
                break;
            case ActionType.DELETE:
                this.quiz.questions.splice(action.target, 1);
                break;
            default:
                break;
        }
    }

    openQuestionForm(index?: number) {
        const questionIndex = index !== undefined ? index : this.quiz.questions.length;
        this.adminService.selectedQuestion = this.getQuestion(questionIndex);

        const questionForm = this.dialog.open(QuestionFormComponent, {
            width: '80%',
            height: '80%',
        });

        questionForm
            .afterClosed()
            .pipe(take(1))
            .subscribe((question?: Question) => {
                if (question) {
                    this.quiz.questions[questionIndex] = question;
                }
            });
    }

    drop(event: CdkDragDrop<Question[]>) {
        if (event.container === event.previousContainer) {
            moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
        } else if (event.previousContainer.data !== this.quiz.questions) {
            copyArrayItem(event.previousContainer.data, event.container.data, event.previousIndex, event.currentIndex);
        }
    }

    submitQuiz() {
        this.processQuiz(this.quiz, this.isNewQuiz());
    }

    close() {
        this.router.navigate(['/home/admin/quizzes']);
    }

    private processQuiz(quiz: Quiz, isNew: boolean) {
        this.submitQuizUpdate(quiz, isNew)
            .pipe(take(1))
            .subscribe((response: ValidationResult<Quiz>) => {
                if (response.error) {
                    this.alert(response.error);
                } else {
                    this.close();
                }
            });
    }

    private getQuestion(index: number): Question {
        return this.quiz.questions[index] || BLANK_QUESTION;
    }

    private alert(error: string) {
        this.dialog.open(AlertComponent, {
            data: { message: error },
            width: '300px',
            height: '300px',
        });
    }

    private isNewQuiz(): boolean {
        return this.quiz.id === '';
    }

    private submitQuizUpdate(quiz: Quiz, isNew: boolean): Observable<ValidationResult<Quiz>> {
        return isNew ? this.adminService.submitQuiz(quiz) : this.adminService.updateQuiz(quiz);
    }
}
