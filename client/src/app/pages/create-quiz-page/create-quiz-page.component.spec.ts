import { CdkDragDrop, DragDropModule } from '@angular/cdk/drag-drop';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { ActivatedRoute, Router } from '@angular/router';
import { AlertComponent } from '@app/components/alert/alert.component';
import { QuestionFormComponent } from '@app/components/question-form/question-form.component';
import { CreateQuizPageComponent } from '@app/pages/create-quiz-page/create-quiz-page.component';
import { AdminQuizzesService } from '@app/services/admin-quizzes.service';
import { Question, Quiz } from '@common/quiz';
import { of } from 'rxjs';
import { QuestionItemComponent } from '@app/components/question-item/question-item.component';
import { QuestionBankComponent } from '@app/components/question-bank/question-bank.component';

describe('CreateQuizPageComponent', () => {
    const TEST_QUESTIONS: Question[] = [
        {
            id: '1',
            text: 'Test Question 1',
            type: 'multiple-choice',
            points: 10,
            choices: [
                { text: 'Choice 1', isCorrect: true },
                { text: 'Choice 2', isCorrect: false },
                { text: 'Choice 3', isCorrect: false },
                { text: 'Choice 4', isCorrect: false },
            ],
        },
        {
            id: '2',
            text: 'Test Question 2',
            type: 'multiple-choice',
            points: 10,
            choices: [
                { text: 'Choice 1', isCorrect: true },
                { text: 'Choice 2', isCorrect: false },
                { text: 'Choice 3', isCorrect: false },
                { text: 'Choice 4', isCorrect: false },
            ],
        },
    ];

    const TEST_QUIZ: Quiz = {
        id: '123',
        title: 'Test Quiz',
        visible: true,
        description: 'Test Description',
        duration: 0,
        lastModification: new Date(),
        questions: TEST_QUESTIONS,
    };

    let component: CreateQuizPageComponent;
    let fixture: ComponentFixture<CreateQuizPageComponent>;
    let adminQuizzesServiceSpy: jasmine.SpyObj<AdminQuizzesService>;
    let routerSpy: jasmine.SpyObj<Router>;
    let dialogSpy: jasmine.SpyObj<MatDialog>;
    let dialogRefSpy: jasmine.SpyObj<MatDialogRef<QuestionFormComponent>>;
    let activatedRouteSpy: jasmine.SpyObj<ActivatedRoute>;

    beforeEach(() => {
        adminQuizzesServiceSpy = jasmine.createSpyObj('AdminQuizzesService', ['getSelectedQuiz', 'submitQuiz', 'transferQuestion', 'updateQuiz']);
        routerSpy = jasmine.createSpyObj('Router', ['navigate']);
        dialogSpy = jasmine.createSpyObj('MatDialog', ['open']);
        dialogRefSpy = jasmine.createSpyObj('MatDialogRef', ['afterClosed']);
        dialogSpy.open.and.returnValue(dialogRefSpy);
        activatedRouteSpy = jasmine.createSpyObj('ActivatedRoute', ['snapshot']);
        Object.defineProperty(activatedRouteSpy, 'snapshot', { value: { url: ['home', 'admin', 'quizzes'] } });
    });

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule({
            declarations: [CreateQuizPageComponent, QuestionItemComponent, QuestionBankComponent],
            imports: [FormsModule, DragDropModule, HttpClientTestingModule, MatIconModule],
            providers: [
                { provide: AdminQuizzesService, useValue: adminQuizzesServiceSpy },
                { provide: Router, useValue: routerSpy },
                { provide: MatDialog, useValue: dialogSpy },
                { provide: ActivatedRoute, useValue: activatedRouteSpy },
            ],
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(CreateQuizPageComponent);
        component = fixture.componentInstance;
        adminQuizzesServiceSpy.getSelectedQuiz.and.returnValue({ ...TEST_QUIZ, questions: [...TEST_QUESTIONS] });
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should get quiz from admin service', () => {
        expect(adminQuizzesServiceSpy.getSelectedQuiz).toHaveBeenCalled();
        expect(component.quiz).toEqual(TEST_QUIZ);
    });

    it('should open question form with existing question', () => {
        dialogRefSpy.afterClosed.and.returnValue(of({ ...TEST_QUESTIONS[0] }));
        component.openQuestionForm(0);
        expect(dialogSpy.open).toHaveBeenCalledWith(QuestionFormComponent, {
            width: '80%',
            height: '80%',
        });
    });

    it('should save changes to existing question', () => {
        dialogRefSpy.afterClosed.and.returnValue(of({ ...TEST_QUESTIONS[1] }));
        component.openQuestionForm(0);
        expect(component.quiz.questions[0]).toEqual(TEST_QUESTIONS[1]);
    });

    it('should open question form with new question', () => {
        dialogRefSpy.afterClosed.and.returnValue(of([]));
        component.openQuestionForm();
        expect(dialogSpy.open).toHaveBeenCalledWith(QuestionFormComponent, {
            width: '80%',
            height: '80%',
        });
    });

    it('should save new question', () => {
        dialogRefSpy.afterClosed.and.returnValue(of({ ...TEST_QUESTIONS[1] }));
        component.openQuestionForm();
        expect(component.quiz.questions).toEqual([...TEST_QUESTIONS, TEST_QUESTIONS[1]]);
    });

    it('should move item within the same container', () => {
        const container = { data: component.quiz.questions };
        const eventSpy: jasmine.SpyObj<CdkDragDrop<Question[]>> = jasmine.createSpyObj('CdkDragDrop', [], {
            container,
            previousContainer: container,
            previousIndex: 0,
            currentIndex: 1,
        });
        component.drop(eventSpy);
        expect(component.quiz.questions).toEqual([TEST_QUESTIONS[1], TEST_QUESTIONS[0]]);
    });

    it('should add a new item to the container', () => {
        const eventSpy: jasmine.SpyObj<CdkDragDrop<Question[]>> = jasmine.createSpyObj('CdkDragDrop', [], {
            container: { data: component.quiz.questions },
            previousContainer: { data: [{ ...TEST_QUESTIONS[0] }] },
            previousIndex: 0,
            currentIndex: 2,
        });
        component.drop(eventSpy);
        expect(component.quiz.questions).toEqual([...TEST_QUESTIONS, TEST_QUESTIONS[0]]);
    });

    it('should handle edit action', () => {
        spyOn(component, 'openQuestionForm');
        component.handle({ type: 'edit', questionIndex: 0 });
        expect(component.openQuestionForm).toHaveBeenCalledWith(0);
    });

    it('should handle delete action', () => {
        spyOn(component.quiz.questions, 'splice');
        component.handle({ type: 'delete', questionIndex: 0 });
        expect(component.quiz.questions.splice).toHaveBeenCalledWith(0, 1);
    });

    it('should handle unknown action', () => {
        spyOn(component, 'openQuestionForm');
        spyOn(component.quiz.questions, 'splice');
        component.handle({ type: 'unknown', questionIndex: 0 });
        expect(component.openQuestionForm).not.toHaveBeenCalled();
        expect(component.quiz.questions.splice).not.toHaveBeenCalled();
    });

    // it('should move item within the same container', () => {});

    it('should subscribe to submitted quiz', () => {
        spyOn(component, 'close');
        component.quiz.id = '';
        adminQuizzesServiceSpy.submitQuiz.and.returnValue(of({ quiz: { ...TEST_QUIZ }, errorLog: '' }));
        component.submitQuiz();
        expect(component.close).toHaveBeenCalled();
        adminQuizzesServiceSpy.submitQuiz.and.returnValue(of({ quiz: undefined, errorLog: 'error' }));
        component.submitQuiz();
        expect(dialogSpy.open).toHaveBeenCalledWith(AlertComponent, {
            data: { message: 'error' },
            width: '300px',
            position: { top: '50%', left: '50%' },
        });
        expect(component.close).toHaveBeenCalledTimes(1);
    });

    it('should subscribe to updated quiz', () => {
        spyOn(component, 'close');
        adminQuizzesServiceSpy.updateQuiz.and.returnValue(of({ quiz: { ...TEST_QUIZ }, errorLog: '' }));
        component.submitQuiz();
        expect(component.close).toHaveBeenCalled();
        adminQuizzesServiceSpy.updateQuiz.and.returnValue(of({ quiz: undefined, errorLog: 'error' }));
        component.submitQuiz();
        expect(dialogSpy.open).toHaveBeenCalledWith(AlertComponent, {
            data: { message: 'error' },
            width: '300px',
            position: { top: '50%', left: '50%' },
        });
        expect(component.close).toHaveBeenCalledTimes(1);
    });

    it('should navigate to previous page', () => {
        component.close();
        expect(routerSpy.navigate).toHaveBeenCalledWith(['/home/admin/quizzes']);
    });
});
