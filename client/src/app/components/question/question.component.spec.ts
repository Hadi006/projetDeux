import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { QuestionData } from '@common/question-data';
import { QuestionComponent } from './question.component';

describe('QuestionComponent', () => {
    let component: QuestionComponent;
    let fixture: ComponentFixture<QuestionComponent>;
    let mockQuestionData: QuestionData;
    let mockIsChecked: boolean[];
    const MAX_GRADE = 100;
    const GRADE = 50;

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule({
            declarations: [QuestionComponent],
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(QuestionComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
        mockQuestionData = {
            id: 0,
            points: 10,
            question: 'question',
            answers: ['answer1', 'answer2', 'answer3', 'answer4'],
            correctAnswers: ['answer1'],
            isMCQ: true,
        };
        mockIsChecked = new Array(mockQuestionData.answers.length).fill(false);
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should correctly assign questionData, isChecked and answerConfirmed if question exists', () => {
        component.question = mockQuestionData;

        expect(component.questionData).toEqual(mockQuestionData);
        expect(component.isChecked).toBeInstanceOf(Array);
        expect(component.isChecked.length).toEqual(mockQuestionData.answers.length);
        expect(component.isChecked.every((value) => value === false)).toBeTrue();
        expect(component.answerConfirmed).toBeFalse();
    });

    it('should not assign questionData, isChecked and answerConfirmed if question does not exist', () => {
        component.question = undefined;
        component.answerConfirmed = true;

        expect(component.questionData).toBeFalsy();
        expect(component.isChecked).toBeFalsy();
        expect(component.answerConfirmed).toBeTrue();
    });

    it('should do nothing if questionData is not defined', () => {
        component.isChecked = mockIsChecked;
        component.answerConfirmed = false;
        const mockEvent = new KeyboardEvent('keyup', { key: '1' });
        component.handleKeyUp(mockEvent);

        expect(component.answerConfirmed).toBeFalse();
        component.isChecked.forEach((value) => {
            expect(value).toBeFalse();
        });
    });

    it('should do nothing if questionData is not MCQ', () => {
        component.questionData = { ...mockQuestionData, isMCQ: false };
        component.isChecked = mockIsChecked;
        component.answerConfirmed = false;
        const mockEvent = new KeyboardEvent('keyup', { key: '1' });
        component.handleKeyUp(mockEvent);

        expect(component.answerConfirmed).toBeFalse();
        component.isChecked.forEach((value) => {
            expect(value).toBeFalse();
        });
    });

    it('should do nothing if canEditAnswer() returns false', () => {
        component.questionData = mockQuestionData;
        component.isChecked = mockIsChecked;
        spyOn(component, 'canEditAnswer').and.returnValue(false);
        component.answerConfirmed = false;
        const mockEvent = new KeyboardEvent('keyup', { key: '1' });
        component.handleKeyUp(mockEvent);

        expect(component.answerConfirmed).toBeFalse();
        component.isChecked.forEach((value) => {
            expect(value).toBeFalse();
        });
    });

    it('should call confirmAnswer() if key press is Enter', () => {
        component.questionData = mockQuestionData;
        component.isChecked = mockIsChecked;
        spyOn(component, 'confirmAnswer');
        const mockEvent = new KeyboardEvent('keyup', { key: 'Enter' });
        component.handleKeyUp(mockEvent);

        expect(component.confirmAnswer).toHaveBeenCalled();
    });

    it('should not call confirmAnswer() if key press is not Enter', () => {
        component.questionData = mockQuestionData;
        component.isChecked = mockIsChecked;
        spyOn(component, 'confirmAnswer');
        const mockEvent = new KeyboardEvent('keyup', { key: '1' });
        component.handleKeyUp(mockEvent);

        expect(component.confirmAnswer).not.toHaveBeenCalled();
    });

    it('should toggle isChecked for a valid key press', () => {
        component.questionData = mockQuestionData;
        component.isChecked = mockIsChecked;
        const mockEvent = new KeyboardEvent('keyup', { key: '1' });
        component.handleKeyUp(mockEvent);

        component.isChecked.forEach((value, index) => {
            if (index === 0) {
                expect(value).toBeTrue();
            } else {
                expect(value).toBeFalse();
            }
        });
    });

    it('should not toggle isChecked if key press is greater than the number of answers', () => {
        component.questionData = mockQuestionData;
        component.isChecked = mockIsChecked;
        const mockEvent = new KeyboardEvent('keyup', { key: '5' });
        component.handleKeyUp(mockEvent);

        component.isChecked.forEach((value) => {
            expect(value).toBeFalse();
        });
    });

    it('should not toggle isChecked for an invalid key press', () => {
        component.questionData = mockQuestionData;
        component.isChecked = mockIsChecked;
        const mockEvent = new KeyboardEvent('keyup', { key: 'f' });
        component.handleKeyUp(mockEvent);

        component.isChecked.forEach((value) => {
            expect(value).toBeFalse();
        });
    });


    it('confirmAnswer() should set answerConfirmed to true and call answerConfirmedNotifier.next()', () => {
        component.answerConfirmedNotifier = jasmine.createSpyObj('Subject<void>', ['next']);
        component.answerConfirmed = false;
        component.confirmAnswer();

        expect(component.answerConfirmed).toBeTrue();
        expect(component.answerConfirmedNotifier.next).toHaveBeenCalled();
    });

    it('canEditAnswer() should return true if answerConfirmed and showingAnswer are false', () => {
        component.answerConfirmed = false;
        component.showingAnswer = false;

        expect(component.canEditAnswer()).toBeTrue();
    });

    it('canEditAnswer() should return false if answerConfirmed is true', () => {
        component.answerConfirmed = true;
        component.showingAnswer = false;

        expect(component.canEditAnswer()).toBeFalse();
    });

    it('canEditAnswer() should return false if showingAnswer is true', () => {
        component.answerConfirmed = false;
        component.showingAnswer = true;

        expect(component.canEditAnswer()).toBeFalse();
    });

    it('canEditAnswer() should return false if answerConfirmed and showingAnswer are true', () => {
        component.answerConfirmed = true;
        component.showingAnswer = true;

        expect(component.canEditAnswer()).toBeFalse();
    });

    it('should calculate grade correctly for MCQ with negative grade', () => {
        component.questionData = mockQuestionData;
        component.isChecked = mockIsChecked;
        component.isChecked[0] = false;
        component.isChecked[1] = false;
        component.isChecked[2] = true;
        component.isChecked[3] = true;

        expect(component.calculateGrade()).toEqual(0);
    });

    it('should calculate grade correctly for non-MCQ', () => {
        component.questionData = { ...mockQuestionData, isMCQ: false };
        component.isChecked = mockIsChecked;

        expect(component.calculateGrade()).toEqual(MAX_GRADE);
    });
});
