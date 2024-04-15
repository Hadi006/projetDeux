import { CdkDragDrop } from '@angular/cdk/drag-drop';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { QuestionFormComponent } from '@app/components/question-form/question-form.component';
import { AdminQuizzesService } from '@app/services/admin-quizzes/admin-quizzes.service';
import { TEST_QUESTIONS } from '@common/constant';
import { Question } from '@common/quiz';
import { of } from 'rxjs';

describe('QuestionFormComponent', () => {
    let testQuestion: Question;

    let component: QuestionFormComponent;
    let fixture: ComponentFixture<QuestionFormComponent>;
    let adminQuizzesServiceSpy: jasmine.SpyObj<AdminQuizzesService>;
    let dialogRefSpy: jasmine.SpyObj<MatDialogRef<QuestionFormComponent>>;
    let dialogSpy: jasmine.SpyObj<MatDialog>;

    beforeEach(() => {
        testQuestion = JSON.parse(JSON.stringify(TEST_QUESTIONS[0]));

        adminQuizzesServiceSpy = jasmine.createSpyObj('AdminQuizzesService', ['submitQuestion']);
        adminQuizzesServiceSpy.selectedQuestion = testQuestion;
        dialogRefSpy = jasmine.createSpyObj('MatDialogRef', ['close']);
        dialogSpy = jasmine.createSpyObj('MatDialog', ['open']);
    });

    beforeEach(waitForAsync(() => {
        // const dialog = jasmine.createSpyObj('MatDialog', ['open']);

        TestBed.configureTestingModule({
            declarations: [QuestionFormComponent],
            imports: [FormsModule, MatIconModule],
            providers: [
                { provide: AdminQuizzesService, useValue: adminQuizzesServiceSpy },
                { provide: MatDialogRef, useValue: dialogRefSpy },
                { provide: MatDialog, useValue: dialogSpy },
            ],
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(QuestionFormComponent);
        component = fixture.componentInstance;
        component.question = { ...testQuestion, choices: [...testQuestion.choices] };
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should initialize question from data', () => {
        expect(component.question).toEqual(testQuestion);
    });

    it('should add choice', () => {
        component.addChoice();
        expect(component.question.choices).toEqual([...testQuestion.choices, { text: '', isCorrect: false }]);
    });

    it('should remove choice', () => {
        component.removeChoice(0);
        expect(component.question.choices).toEqual([
            {
                text: 'Test Answer 2',
                isCorrect: false,
            },
        ]);
    });

    it('should track by index', () => {
        expect(component.trackByFn(0)).toBe(0);
    });

    it('should swap choices', () => {
        const cdkDragDropSpy = jasmine.createSpyObj<CdkDragDrop<Question[]>>(['previousIndex', 'currentIndex']);
        cdkDragDropSpy.previousIndex = 0;
        cdkDragDropSpy.currentIndex = 1;
        component.drop(cdkDragDropSpy);
        expect(component.question.choices).toEqual([
            {
                text: 'Test Answer 2',
                isCorrect: false,
            },
            {
                text: 'Test Answer 1',
                isCorrect: false,
            },
        ]);
    });

    it('should subscribe to submitted question', () => {
        adminQuizzesServiceSpy.submitQuestion.and.returnValue(of(''));
        component.submit();
        expect(dialogRefSpy.close).toHaveBeenCalledWith(testQuestion);
        const errorMsg = 'error';
        adminQuizzesServiceSpy.submitQuestion.and.returnValue(of(errorMsg));
        component.submit();
        expect(dialogSpy.open).toHaveBeenCalledWith(jasmine.anything(), { data: { message: errorMsg } });
    });

    it('should open a confirmation dialog and remove choice if confirmed', () => {
        const dialogRef = jasmine.createSpyObj('dialogRef', { afterClosed: of(true) });
        dialogSpy.open.and.returnValue(dialogRef);
        spyOn(component, 'removeChoice');

        component.openConfirmationDialog(1);

        expect(dialogSpy.open).toHaveBeenCalled();
        expect(component.removeChoice).toHaveBeenCalledWith(1);
    });
});
