import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { QuestionHandlerService } from '@app/services/question-handler.service';
import { QuestionData } from '@common/question-data';
import { Subject } from 'rxjs';
import { QuestionComponent } from './question.component';

describe('QuestionComponent', () => {
    let component: QuestionComponent;
    let fixture: ComponentFixture<QuestionComponent>;
    let questionHandlerService: jasmine.SpyObj<QuestionHandlerService>;
    let mockQuestionData: QuestionData;
    let mockIsChecked: boolean[];

    beforeEach(() => {
        questionHandlerService = jasmine.createSpyObj('QuestionHandlerService', ['questions']);
        spyOnProperty(questionHandlerService, 'questions', 'get').and.returnValue(new Subject<QuestionData | undefined>());
    });

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule({
            declarations: [QuestionComponent],
            providers: [
                {
                    provide: QuestionHandlerService,
                    useValue: questionHandlerService,
                },
            ],
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
        questionHandlerService.questions.next(mockQuestionData);

        expect(component.question).toEqual(mockQuestionData);
        expect(component.isChecked).toBeInstanceOf(Array);
        expect(component.isChecked.length).toEqual(mockQuestionData.answers.length);
        expect(component.isChecked.every((value) => value === false)).toBeTrue();
        expect(component.answerConfirmed).toBeFalse();
    });

    it('should do nothing if question is undefined', () => {
        questionHandlerService.questions.next(undefined);

        expect(component.question).toBeFalsy();
        expect(component.isChecked).toBeFalsy();
        expect(component.answerConfirmed).toBeFalse();
    });

    it('keyboardEvent should do nothing if questionData is not defined', () => {
        const mockOne = new KeyboardEvent('keyup', { key: '1' });
        spyOn(mockOne, 'stopPropagation');
        component.handleKeyUp(mockOne);

        const mockEnter = new KeyboardEvent('keyup', { key: 'Enter' });
        spyOn(mockEnter, 'stopPropagation');
        component.handleKeyUp(mockEnter);

        spyOn(component, 'confirmAnswer');
        spyOnProperty(component, 'isChecked', 'get').and.callThrough();

        expect(mockOne.stopPropagation).not.toHaveBeenCalled();
        expect(mockEnter.stopPropagation).not.toHaveBeenCalled();
        expect(component.confirmAnswer).not.toHaveBeenCalled();
        expect(component.isChecked).toBeFalsy();
    });

    it('should do nothing if questionData is not MCQ', () => {
        questionHandlerService.questions.next({ ...mockQuestionData, isMCQ: false });

        spyOn(component, 'confirmAnswer');
        spyOnProperty(component, 'isChecked', 'get').and.callThrough();

        const mockOne = new KeyboardEvent('keyup', { key: '1' });
        spyOn(mockOne, 'stopPropagation');
        component.handleKeyUp(mockOne);

        const mockEnter = new KeyboardEvent('keyup', { key: 'Enter' });
        spyOn(mockEnter, 'stopPropagation');
        component.handleKeyUp(mockEnter);

        expect(mockOne.stopPropagation).not.toHaveBeenCalled();
        expect(mockEnter.stopPropagation).not.toHaveBeenCalled();
        expect(component.confirmAnswer).not.toHaveBeenCalled();
        expect(component.isChecked).toEqual([]);
    });

    it('should do nothing if canEditAnswer() returns false', () => {
        questionHandlerService.questions.next(mockQuestionData);

        spyOn(component, 'canEditAnswer').and.returnValue(false);
        component.answerConfirmed = false;
        spyOn(component, 'confirmAnswer');
        spyOnProperty(component, 'isChecked', 'get').and.callThrough();

        const mockOne = new KeyboardEvent('keyup', { key: '1' });
        spyOn(mockOne, 'stopPropagation');
        component.handleKeyUp(mockOne);

        const mockEnter = new KeyboardEvent('keyup', { key: 'Enter' });
        spyOn(mockEnter, 'stopPropagation');
        component.handleKeyUp(mockEnter);

        expect(component.answerConfirmed).toBeFalse();
        component.isChecked.forEach((value) => {
            expect(value).toBeFalse();
        });
    });

    it('should call confirmAnswer() and stopPropagation if key press is Enter', () => {
        questionHandlerService.questions.next(mockQuestionData);

        spyOn(component, 'confirmAnswer');
        const mockEnter = new KeyboardEvent('keyup', { key: 'Enter' });
        spyOn(mockEnter, 'stopPropagation');
        component.handleKeyUp(mockEnter);

        expect(component.confirmAnswer).toHaveBeenCalled();
        expect(mockEnter.stopPropagation).toHaveBeenCalled();
    });

    it('should not call confirmAnswer() if key press is not Enter', () => {
        questionHandlerService.questions.next(mockQuestionData);

        spyOn(component, 'confirmAnswer');
        const mockOne = new KeyboardEvent('keyup', { key: '1' });
        spyOn(mockOne, 'stopPropagation');
        component.handleKeyUp(mockOne);

        expect(component.confirmAnswer).not.toHaveBeenCalled();
        expect(mockOne.stopPropagation).toHaveBeenCalled();
    });

    it('should toggle isChecked for a valid key press', () => {
        questionHandlerService.questions.next(mockQuestionData);

        const mockOne = new KeyboardEvent('keyup', { key: '1' });
        spyOn(mockOne, 'stopPropagation');
        component.handleKeyUp(mockOne);

        component.isChecked.forEach((value, index) => {
            if (index === 0) {
                expect(value).toBeTrue();
            } else {
                expect(value).toBeFalse();
            }
        });
        expect(mockOne.stopPropagation).toHaveBeenCalled();
    });

    it('should not toggle isChecked if key press is greater than the number of answers', () => {
        questionHandlerService.questions.next(mockQuestionData);

        const mockFive = new KeyboardEvent('keyup', { key: '5' });
        spyOn(mockFive, 'stopPropagation');
        component.handleKeyUp(mockFive);

        component.isChecked.forEach((value) => {
            expect(value).toBeFalse();
        });
        expect(mockFive.stopPropagation).toHaveBeenCalled();
    });

    it('should not toggle isChecked for an invalid key press', () => {
        questionHandlerService.questions.next(mockQuestionData);

        const mockF = new KeyboardEvent('keyup', { key: 'f' });
        spyOn(mockF, 'stopPropagation');
        component.handleKeyUp(mockF);

        component.isChecked.forEach((value) => {
            expect(value).toBeFalse();
        });
        expect(mockF.stopPropagation).toHaveBeenCalled();
    });

    it('confirmAnswer() should set answerConfirmed to true and call player.answerNotifier.next() with the correct value', () => {
        component.player = { score: 0, answerNotifier: new Subject<boolean[]>() };
        component.player.answerNotifier = jasmine.createSpyObj('Subject<boolean[]>', ['next']);
        component.answerConfirmed = false;
        component.confirmAnswer();

        expect(component.answerConfirmed).toBeTrue();
        expect(component.player.answerNotifier.next).toHaveBeenCalledWith(component.isChecked);
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
});
