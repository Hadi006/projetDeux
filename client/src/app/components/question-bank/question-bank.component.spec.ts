import { CdkDragDrop, DragDropModule } from '@angular/cdk/drag-drop';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { ActivatedRoute } from '@angular/router';
import { AlertComponent } from '@app/components/alert/alert.component';
import { QuestionBankComponent } from '@app/components/question-bank/question-bank.component';
import { QuestionFormComponent } from '@app/components/question-form/question-form.component';
import { QuestionItemComponent } from '@app/components/question-item/question-item.component';
import { AdminQuizzesService } from '@app/services/admin-quizzes.service';
import { QuestionBankService } from '@app/services/question-bank.service';
import { Question } from '@common/quiz';
import { of } from 'rxjs';

describe('QuestionBankComponent', () => {
    const questions: Question[] = [
        {
            id: '0',
            text: 'text0',
            type: 'multiple-choices',
            points: 1,
            choices: [
                { text: 'text01', isCorrect: true },
                { text: 'text02', isCorrect: false },
            ],
            lastModification: new Date('2021-07-03'),
        },
        {
            id: '1',
            text: 'text1',
            type: 'multiple-choices',
            points: 1,
            choices: [
                { text: 'text11', isCorrect: true },
                { text: 'text12', isCorrect: false },
            ],
            lastModification: new Date('2021-07-02'),
        },
        {
            id: '2',
            text: 'text2',
            type: 'multiple-choices',
            points: 1,
            choices: [
                { text: 'text21', isCorrect: true },
                { text: 'text22', isCorrect: false },
            ],
            lastModification: new Date('2021-07-01'),
        },
    ];

    let component: QuestionBankComponent;
    let fixture: ComponentFixture<QuestionBankComponent>;
    let questionBankServiceSpy: jasmine.SpyObj<QuestionBankService>;
    let matDialogSpy: jasmine.SpyObj<MatDialog>;
    let matDialogRefSpy: jasmine.SpyObj<MatDialogRef<QuestionFormComponent>>;
    let adminServiceSpy: jasmine.SpyObj<AdminQuizzesService>;
    let activatedRouteSpy: jasmine.SpyObj<ActivatedRoute>;

    beforeEach(() => {
        questionBankServiceSpy = jasmine.createSpyObj('QuestionBankService', [
            'questions$',
            'fetchQuestions',
            'deleteQuestion',
            'addQuestion',
            'getQuestion',
            'updateQuestion',
        ]);
        matDialogSpy = jasmine.createSpyObj('MatDialog', ['open']);
        matDialogRefSpy = jasmine.createSpyObj('MatDialogRef', ['afterClosed']);
        matDialogSpy.open.and.returnValue(matDialogRefSpy);

        Object.defineProperty(questionBankServiceSpy, 'questions$', { value: of([...questions]) });
        questionBankServiceSpy.fetchQuestions.and.returnValue();
        adminServiceSpy = jasmine.createSpyObj('AdminService', [], {
            selectedQuestion: { questions },
        });
        activatedRouteSpy = jasmine.createSpyObj('ActivatedRoute', ['snapshot']);
        Object.defineProperty(activatedRouteSpy, 'snapshot', { value: { url: ['home', 'admin', 'quizzes'] } });
    });

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule({
            declarations: [QuestionBankComponent, QuestionItemComponent],
            imports: [HttpClientTestingModule, DragDropModule, MatIconModule],
            providers: [
                { provide: QuestionBankService, useValue: questionBankServiceSpy },
                { provide: MatDialog, useValue: matDialogSpy },
                { provide: AdminQuizzesService, useValue: adminServiceSpy },
                { provide: ActivatedRoute, useValue: activatedRouteSpy },
            ],
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(QuestionBankComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should order questions by lastModification date', () => {
        const SORTED_QUESTIONS: Question[] = [...questions];
        SORTED_QUESTIONS.reverse();
        component.ngOnInit();
        component.questions.subscribe((sortedQuestions: Question[]) => {
            expect(sortedQuestions).toEqual(SORTED_QUESTIONS);
        });
    });

    it('should order questions with no lastModification date', () => {
        const NO_MODIFICATION_DATE: Question = {
            id: '3',
            text: 'text3',
            type: 'multiple-choices',
            points: 1,
            choices: [
                { text: 'text31', isCorrect: true },
                { text: 'text32', isCorrect: false },
            ],
            lastModification: undefined,
        };
        const UNORDERED_QUESTIONS: Question[] = [...questions, NO_MODIFICATION_DATE, NO_MODIFICATION_DATE];
        const REVERSED_QUESTIONS = [...questions];
        REVERSED_QUESTIONS.reverse();
        const SORTED_QUESTIONS: Question[] = [NO_MODIFICATION_DATE, NO_MODIFICATION_DATE, ...REVERSED_QUESTIONS];
        Object.defineProperty(questionBankServiceSpy, 'questions$', { value: of(UNORDERED_QUESTIONS) });
        component.ngOnInit();
        component.questions.subscribe((sortedQuestions: Question[]) => {
            expect(sortedQuestions).toEqual(SORTED_QUESTIONS);
        });
    });

    it('should call openQuestionForm when handle is called with type edit', () => {
        const openQuestionFormSpy = spyOn(component, 'openQuestionForm');
        component.handle({ type: 'edit', questionIndex: 0 });
        expect(openQuestionFormSpy).toHaveBeenCalledWith(0);
    });

    it('should call questionBank.deleteQuestion when handle is called with type delete', () => {
        component.handle({ type: 'delete', questionIndex: 0 });
        expect(questionBankServiceSpy.deleteQuestion).toHaveBeenCalledWith(0);
    });

    it('should do nothing when handle is called with an unknown type', () => {
        expect(() => component.handle({ type: 'unknown', questionIndex: 0 })).not.toThrow();
    });

    it('should do nothing when drop is called with invalid data', () => {
        component.drop({ container: { data: null }, previousContainer: { data: null } } as CdkDragDrop<Question[] | null>);
        expect(questionBankServiceSpy.addQuestion).not.toHaveBeenCalled();
    });

    it('should call questionBank.addQuestion when drop is called with valid data', () => {
        questionBankServiceSpy.addQuestion.and.returnValue(of(''));
        component.drop({ container: { data: questions }, previousContainer: { data: questions }, previousIndex: 0 } as CdkDragDrop<
            Question[] | null
        >);
        expect(questionBankServiceSpy.addQuestion).toHaveBeenCalledWith(questions[0]);
    });

    it('should open AlertComponent when questionBank.addQuestion returns an error', () => {
        questionBankServiceSpy.addQuestion.and.returnValue(of('error'));
        component.drop({ container: { data: questions }, previousContainer: { data: questions }, previousIndex: 0 } as CdkDragDrop<
            Question[] | null
        >);
        expect(matDialogSpy.open).toHaveBeenCalled();
    });

    it('should open QuestionFormComponent when openQuestionForm is called', () => {
        questionBankServiceSpy.getQuestion.and.returnValue(questions[0]);
        matDialogRefSpy.afterClosed.and.returnValue(of(undefined));
        component.openQuestionForm(0);
        expect(matDialogSpy.open).toHaveBeenCalledWith(QuestionFormComponent, {
            width: '80%',
            height: '80%',
        });
    });

    it('should call questionBank.updateQuestion when openQuestionForm is called with an existing question', () => {
        questionBankServiceSpy.getQuestion.and.returnValue(questions[0]);
        matDialogRefSpy.afterClosed.and.returnValue(of(questions[0]));
        questionBankServiceSpy.updateQuestion.and.returnValue(of(''));
        component.openQuestionForm(0);
        expect(questionBankServiceSpy.getQuestion).toHaveBeenCalledWith(0);
        expect(questionBankServiceSpy.updateQuestion).toHaveBeenCalledWith(questions[0]);
        expect(questionBankServiceSpy.addQuestion).not.toHaveBeenCalled();
    });

    it('should call questionBank.addQuestion when openQuestionForm is called with a new question', () => {
        const INVALID_INDEX = -1;
        questionBankServiceSpy.getQuestion.and.returnValue(questions[0]);
        matDialogRefSpy.afterClosed.and.returnValue(of(questions[0]));
        questionBankServiceSpy.addQuestion.and.returnValue(of(''));
        component.openQuestionForm();
        expect(questionBankServiceSpy.getQuestion).toHaveBeenCalledWith(INVALID_INDEX);
        expect(questionBankServiceSpy.addQuestion).toHaveBeenCalledWith(questions[0]);
        expect(questionBankServiceSpy.updateQuestion).not.toHaveBeenCalled();
    });

    it('should open AlertComponent when questionBank.addQuestion returns an error', () => {
        const ERROR_MSG = 'error';
        matDialogRefSpy.afterClosed.and.returnValue(of(questions[0]));
        questionBankServiceSpy.addQuestion.and.returnValue(of(ERROR_MSG));
        component.openQuestionForm();
        expect(matDialogSpy.open).toHaveBeenCalledWith(AlertComponent, { data: { message: ERROR_MSG } });
    });

    it('should open AlertComponent when questionBank.updateQuestion returns an error', () => {
        const ERROR_MSG = 'error';
        matDialogRefSpy.afterClosed.and.returnValue(of(questions[0]));
        questionBankServiceSpy.getQuestion.and.returnValue(questions[0]);
        questionBankServiceSpy.updateQuestion.and.returnValue(of(ERROR_MSG));
        component.openQuestionForm(0);
        expect(matDialogSpy.open).toHaveBeenCalledWith(AlertComponent, { data: { message: ERROR_MSG } });
    });
});
