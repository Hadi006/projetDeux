import { CdkDragDrop, copyArrayItem, moveItemInArray } from '@angular/cdk/drag-drop';
import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { QuestionFormComponent } from '@app/components/question-form/question-form.component';
import { AdminQuizzesService } from '@app/services/admin-quizzes.service';
import { Question, Quiz } from '@common/quiz';

@Component({
    selector: 'app-create-quiz-page',
    templateUrl: './create-quiz-page.component.html',
    styleUrls: ['./create-quiz-page.component.scss'],
})
export class CreateQuizPageComponent implements OnInit {
    quiz: Quiz;

    constructor(
        private admin: AdminQuizzesService,
        private router: Router,
        private dialog: MatDialog,
    ) {}

    ngOnInit() {
        this.quiz = this.admin.getSelectedQuiz();
    }

    handle(action: { type: string; questionIndex: number }) {
        switch (action.type) {
            case 'edit':
                this.openQuestionForm(action.questionIndex);
                break;
            case 'delete':
                this.quiz.questions.splice(action.questionIndex, 1);
                break;
            default:
                break;
        }
    }

    openQuestionForm(index?: number) {
        const INDEX = index !== undefined ? index : this.quiz.questions.length;
        const QUESTION = this.getQuestion(INDEX);
        this.admin.selectedQuestion = QUESTION;

        const QUESTION_FORM = this.dialog.open(QuestionFormComponent, {
            width: '50%',
            height: '50%',
        });

        QUESTION_FORM.afterClosed().subscribe((question?: Question) => {
            if (question) {
                this.quiz.questions[INDEX] = question;
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
        const isNewQuiz = this.quiz.id === '';
        this.processQuiz(this.quiz, isNewQuiz);
    }
}
