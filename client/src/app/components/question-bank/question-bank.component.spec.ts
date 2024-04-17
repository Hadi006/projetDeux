import { CdkDragDrop, DragDropModule } from '@angular/cdk/drag-drop';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { ActivatedRoute } from '@angular/router';
import { AlertComponent } from '@app/components/alert/alert.component';
import { QuestionBankComponent } from '@app/components/question-bank/question-bank.component';
import { QuestionFormComponent } from '@app/components/question-form/question-form.component';
import { QuestionItemComponent } from '@app/components/question-item/question-item.component';
import { AdminQuizzesService } from '@app/services/admin-quizzes/admin-quizzes.service';
import { QuestionBankService } from '@app/services/question-bank/question-bank.service';
import { ActionType } from '@common/action';
import { QuestionType, TEST_QUESTIONS } from '@common/constant';
import { Question } from '@common/quiz';
import { of } from 'rxjs';

describe('QuestionBankComponent', () => {
    let testQuestions: Question[];

    let component: QuestionBankComponent;
    let fixture: ComponentFixture<QuestionBankComponent>;
    let questionBankServiceSpy: jasmine.SpyObj<QuestionBankService>;
    let matDialogSpy: jasmine.SpyObj<MatDialog>;
    let matDialogRefSpy: jasmine.SpyObj<MatDialogRef<QuestionFormComponent>>;
    let adminServiceSpy: jasmine.SpyObj<AdminQuizzesService>;
    let activatedRouteSpy: jasmine.SpyObj<ActivatedRoute>;

    beforeEach(() => {
        testQuestions = JSON.parse(JSON.stringify(TEST_QUESTIONS));

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

        Object.defineProperty(questionBankServiceSpy, 'questions$', { value: of(testQuestions) });
        questionBankServiceSpy.fetchQuestions.and.returnValue();
        adminServiceSpy = jasmine.createSpyObj('AdminService', [], {
            selectedQuestion: { testQuestions },
        });
        activatedRouteSpy = jasmine.createSpyObj('ActivatedRoute', ['snapshot']);
        Object.defineProperty(activatedRouteSpy, 'snapshot', { value: { url: ['home', 'admin', 'quizzes'] } });
    });

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule({
            declarations: [QuestionBankComponent, QuestionItemComponent],
            imports: [HttpClientTestingModule, DragDropModule, MatIconModule, FormsModule],
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
        const SORTED_QUESTIONS: Question[] = testQuestions;
        SORTED_QUESTIONS.reverse();
        component.ngOnInit();
        component.questions.subscribe((sortedQuestions: Question[]) => {
            expect(sortedQuestions).toEqual(SORTED_QUESTIONS);
        });
    });

    it('should order questions with no lastModification date', () => {
        const NO_MODIFICATION_DATE: Question = { ...testQuestions[0], lastModification: undefined };
        const UNORDERED_QUESTIONS: Question[] = [{ ...testQuestions[0] }, { ...NO_MODIFICATION_DATE }, { ...NO_MODIFICATION_DATE }];
        const REVERSED_QUESTIONS = [{ ...testQuestions[0] }];
        REVERSED_QUESTIONS.reverse();
        const SORTED_QUESTIONS: Question[] = [{ ...NO_MODIFICATION_DATE }, { ...NO_MODIFICATION_DATE }, ...REVERSED_QUESTIONS];
        Object.defineProperty(questionBankServiceSpy, 'questions$', { value: of(UNORDERED_QUESTIONS) });
        component.ngOnInit();
        component.questions.subscribe((sortedQuestions: Question[]) => {
            expect(sortedQuestions).toEqual(SORTED_QUESTIONS);
        });
    });

    it('should call openQuestionForm when handle is called with type edit', () => {
        const openQuestionFormSpy = spyOn(component, 'openQuestionForm');
        component.handle({ type: ActionType.EDIT, target: 0 });
        expect(openQuestionFormSpy).toHaveBeenCalledWith(0);
    });

    it('should call questionBank.deleteQuestion when handle is called with type delete', () => {
        component.handle({ type: ActionType.DELETE, target: 0 });
        expect(questionBankServiceSpy.deleteQuestion).toHaveBeenCalledWith(0);
    });

    it('should do nothing when handle is called with an invalid type', () => {
        spyOn(component, 'openQuestionForm');
        component.handle({ type: ActionType.EXPORT, target: 0 });
        expect(questionBankServiceSpy.deleteQuestion).not.toHaveBeenCalled();
        expect(component.openQuestionForm).not.toHaveBeenCalled();
    });

    it('should do nothing when drop is called with invalid data', () => {
        component.drop({ container: { data: null }, previousContainer: { data: null } } as CdkDragDrop<Question[] | null>);
        expect(questionBankServiceSpy.addQuestion).not.toHaveBeenCalled();
    });

    it('should call questionBank.addQuestion when drop is called with valid data', () => {
        questionBankServiceSpy.addQuestion.and.returnValue(of(''));
        component.drop({ container: { data: testQuestions }, previousContainer: { data: testQuestions }, previousIndex: 0 } as CdkDragDrop<
            Question[] | null
        >);
        expect(questionBankServiceSpy.addQuestion).toHaveBeenCalledWith(testQuestions[0]);
    });

    it('should open AlertComponent when questionBank.addQuestion returns an error', () => {
        questionBankServiceSpy.addQuestion.and.returnValue(of('error'));
        component.drop({ container: { data: testQuestions }, previousContainer: { data: testQuestions }, previousIndex: 0 } as CdkDragDrop<
            Question[] | null
        >);
        expect(matDialogSpy.open).toHaveBeenCalled();
    });

    it('should open QuestionFormComponent when openQuestionForm is called', () => {
        questionBankServiceSpy.getQuestion.and.returnValue(testQuestions[0]);
        matDialogRefSpy.afterClosed.and.returnValue(of(undefined));
        component.openQuestionForm(0);
        expect(matDialogSpy.open).toHaveBeenCalledWith(QuestionFormComponent, {
            width: '80%',
            height: '80%',
        });
    });

    it('should call questionBank.updateQuestion when openQuestionForm is called with an existing question', () => {
        questionBankServiceSpy.getQuestion.and.returnValue(testQuestions[0]);
        matDialogRefSpy.afterClosed.and.returnValue(of(testQuestions[0]));
        questionBankServiceSpy.updateQuestion.and.returnValue(of(''));
        component.openQuestionForm(0);
        expect(questionBankServiceSpy.getQuestion).toHaveBeenCalledWith(0);
        expect(questionBankServiceSpy.updateQuestion).toHaveBeenCalledWith(testQuestions[0]);
        expect(questionBankServiceSpy.addQuestion).not.toHaveBeenCalled();
    });

    it('should call questionBank.addQuestion when openQuestionForm is called with a new question', () => {
        const INVALID_INDEX = -1;
        questionBankServiceSpy.getQuestion.and.returnValue(testQuestions[0]);
        matDialogRefSpy.afterClosed.and.returnValue(of(testQuestions[0]));
        questionBankServiceSpy.addQuestion.and.returnValue(of(''));
        component.openQuestionForm();
        expect(questionBankServiceSpy.getQuestion).toHaveBeenCalledWith(INVALID_INDEX);
        expect(questionBankServiceSpy.addQuestion).toHaveBeenCalledWith(testQuestions[0]);
        expect(questionBankServiceSpy.updateQuestion).not.toHaveBeenCalled();
    });

    it('should open AlertComponent when questionBank.addQuestion returns an error', () => {
        const ERROR_MSG = 'error';
        matDialogRefSpy.afterClosed.and.returnValue(of(testQuestions[0]));
        questionBankServiceSpy.addQuestion.and.returnValue(of(ERROR_MSG));
        component.openQuestionForm();
        expect(matDialogSpy.open).toHaveBeenCalledWith(AlertComponent, { data: { message: ERROR_MSG } });
    });

    it('should open AlertComponent when questionBank.updateQuestion returns an error', () => {
        const ERROR_MSG = 'error';
        matDialogRefSpy.afterClosed.and.returnValue(of(testQuestions[0]));
        questionBankServiceSpy.getQuestion.and.returnValue(testQuestions[0]);
        questionBankServiceSpy.updateQuestion.and.returnValue(of(ERROR_MSG));
        component.openQuestionForm(0);
        expect(matDialogSpy.open).toHaveBeenCalledWith(AlertComponent, { data: { message: ERROR_MSG } });
    });

    it('should filter questions by selected type', () => {
        component.selectedType = QuestionType.Qrl;
        component.questions = of<Question[]>([
            {
                text: 'Question 1',
                type: QuestionType.Qrl,
                points: 10,
                choices: [],
                qrlAnswer: 'Answer 1',
            },
            {
                text: 'Question 2',
                type: QuestionType.Qrl,
                points: 5,
                choices: [],
                qrlAnswer: 'Answer 2',
            },
            {
                text: 'Question 3',
                type: QuestionType.Qcm,
                points: 8,
                choices: [],
                qrlAnswer: 'Answer 3',
            },
            {
                text: 'Question 4',
                type: QuestionType.Qrl,
                points: 3,
                choices: [],
                qrlAnswer: 'Answer 4',
            },
        ]);

        component.filterQuestions();

        component.filteredQuestions.subscribe((filteredQuestions) => {
            expect(filteredQuestions.length).toBe(3); // Only QRL questions should be filtered
            expect(filteredQuestions[0].type).toBe('QRL');
            expect(filteredQuestions[1].type).toBe('QRL');
            expect(filteredQuestions[2].type).toBe('QRL');
        });
    });
});
