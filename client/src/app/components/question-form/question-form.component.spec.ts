import { CdkDragDrop } from '@angular/cdk/drag-drop';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { QuestionFormComponent } from '@app/components/question-form/question-form.component';
import { AdminQuizzesService } from '@app/services/admin-quizzes.service';
import { Question } from '@common/quiz';
import { of } from 'rxjs';

describe('QuestionFormComponent', () => {
    let component: QuestionFormComponent;
    let fixture: ComponentFixture<QuestionFormComponent>;
    let adminQuizzesServiceSpy: jasmine.SpyObj<AdminQuizzesService>;
    let dialogRefSpy: jasmine.SpyObj<MatDialogRef<QuestionFormComponent>>;
    let dialogSpy: jasmine.SpyObj<MatDialog>;

    const TEST_QUESTION = {
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
    };

    beforeEach(() => {
        adminQuizzesServiceSpy = jasmine.createSpyObj('AdminQuizzesService', ['submitQuestion']);
        dialogRefSpy = jasmine.createSpyObj('MatDialogRef', ['close']);
        dialogSpy = jasmine.createSpyObj('MatDialog', ['open']);
    });

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule({
            declarations: [QuestionFormComponent],
            imports: [FormsModule],
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
        component.question = { ...TEST_QUESTION, choices: [...TEST_QUESTION.choices] };
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should initialize question from data', () => {
        expect(component.question).toEqual(TEST_QUESTION);
    });

    it('should add choice', () => {
        component.addChoice();
        expect(component.question.choices).toEqual([...TEST_QUESTION.choices, { text: '', isCorrect: false }]);
    });

    it('should remove choice', () => {
        component.removeChoice(0);
        expect(component.question.choices).toEqual([
            { text: 'Choice 2', isCorrect: false },
            { text: 'Choice 3', isCorrect: false },
            { text: 'Choice 4', isCorrect: false },
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
            { text: 'Choice 2', isCorrect: false },
            { text: 'Choice 1', isCorrect: true },
            { text: 'Choice 3', isCorrect: false },
            { text: 'Choice 4', isCorrect: false },
        ]);
    });

    it('should subscribe to submitted question', () => {
        adminQuizzesServiceSpy.submitQuestion.and.returnValue(of(''));
        component.submit();
        expect(dialogRefSpy.close).toHaveBeenCalledWith(TEST_QUESTION);
        const errorMsg = 'error';
        adminQuizzesServiceSpy.submitQuestion.and.returnValue(of(errorMsg));
        component.submit();
        expect(dialogSpy.open).toHaveBeenCalledWith(jasmine.anything(), { data: { message: errorMsg } });
    });
});
