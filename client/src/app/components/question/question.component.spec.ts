import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { QuestionHandlerService } from '@app/services/question-handler.service';
import { QUESTIONS_DATA } from '@app/services/game-handler.service';
import { GameStateService, GameState } from '@app/services/game-state.service';
import { QuestionComponent } from './question.component';
import { Player } from '@app/interfaces/player';

const TEST_PLAYER: Player = {
    score: 0,
    answer: [false, true, false, false],
    answerConfirmed: false,
    confirmAnswer: () => {
        return;
    },
};

describe('QuestionComponent', () => {
    let component: QuestionComponent;
    let fixture: ComponentFixture<QuestionComponent>;
    let questionHandlerServiceSpy: jasmine.SpyObj<QuestionHandlerService>;
    let gameStateServiceSpy: jasmine.SpyObj<GameStateService>;

    beforeEach(() => {
        questionHandlerServiceSpy = jasmine.createSpyObj<QuestionHandlerService>('QuestionHandlerService', ['currentQuestion']);
        Object.defineProperty(questionHandlerServiceSpy, 'currentQuestion', {
            get: () => {
                return undefined;
            },
            configurable: true,
        });

        gameStateServiceSpy = jasmine.createSpyObj<GameStateService>('GameStateService', ['gameState']);
        Object.defineProperty(gameStateServiceSpy, 'gameState', {
            get: () => {
                return GameState.ShowQuestion;
            },
            configurable: true,
        });
    });

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule({
            declarations: [QuestionComponent],
            providers: [
                { provide: QuestionHandlerService, useValue: questionHandlerServiceSpy },
            ],
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(QuestionComponent);
        component = fixture.componentInstance;
        component.player = TEST_PLAYER;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('questionData getter should return currentQuestion', () => {
        spyOnProperty(questionHandlerServiceSpy, 'currentQuestion', 'get').and.returnValue(QUESTIONS_DATA[0]);
        expect(component.questionData).toBe(QUESTIONS_DATA[0]);
    });

    it('isChecked getter should return the players answer', () => {
        expect(component.isChecked).toBe(TEST_PLAYER.answer);
    });

    it('showingAnswer getter should return true when game state is ShowAnswer', () => {
        spyOnProperty(gameStateServiceSpy, 'gameState', 'get').and.returnValue(GameState.ShowAnswer);
        expect(component.showingAnswer).toBeTrue();
    });

    it('handleKeyUp should do nothing if there is no question data', () => {
        const mockEvent = new KeyboardEvent('keyup');
        spyOn(mockEvent, 'stopPropagation');
        spyOn(component, 'confirmAnswer');
        component.handleKeyUp(mockEvent);
        expect(mockEvent.stopPropagation).not.toHaveBeenCalled();
        expect(component.confirmAnswer).not.toHaveBeenCalled();
        expect(component.isChecked).toBe(TEST_PLAYER.answer);
    });

    it('handleKeyUp should do nothing if question is open ended', () => {
        const mockEvent = new KeyboardEvent('keyup');
        spyOn(mockEvent, 'stopPropagation');
        spyOn(component, 'confirmAnswer');
        spyOnProperty(questionHandlerServiceSpy, 'currentQuestion', 'get').and.returnValue(QUESTIONS_DATA[1]);
        component.handleKeyUp(mockEvent);
        expect(mockEvent.stopPropagation).not.toHaveBeenCalled();
        expect(component.confirmAnswer).not.toHaveBeenCalled();
        expect(component.isChecked).toBe(TEST_PLAYER.answer);
    });

    it('handleKeyUp should do nothing if answer cant be edited', () => {
        const mockEvent = new KeyboardEvent('keyup');
        spyOn(mockEvent, 'stopPropagation');
        spyOn(component, 'confirmAnswer');
        spyOn(component, 'canEditAnswer').and.returnValue(false);
        component.handleKeyUp(mockEvent);
        expect(mockEvent.stopPropagation).not.toHaveBeenCalled();
        expect(component.confirmAnswer).not.toHaveBeenCalled();
        expect(component.isChecked).toBe(TEST_PLAYER.answer);
    });

    it('handleKeyUp should call confirmAnswer if enter key is pressed', () => {
        const mockEvent = new KeyboardEvent('keyup', { key: 'Enter' });
        spyOn(mockEvent, 'stopPropagation');
        spyOn(component, 'confirmAnswer');
        spyOnProperty(questionHandlerServiceSpy, 'currentQuestion', 'get').and.returnValue(QUESTIONS_DATA[0]);
        spyOn(component, 'canEditAnswer').and.returnValue(true);
        component.handleKeyUp(mockEvent);
        expect(mockEvent.stopPropagation).toHaveBeenCalled();
        expect(component.confirmAnswer).toHaveBeenCalled();
    });

    it('handleKeyUp should toggle answer if a valid number key is pressed', () => {
        const mockEvent = new KeyboardEvent('keyup', { key: '1' });
        spyOn(mockEvent, 'stopPropagation');
        spyOn(component, 'confirmAnswer');
        spyOnProperty(questionHandlerServiceSpy, 'currentQuestion', 'get').and.returnValue(QUESTIONS_DATA[0]);
        spyOn(component, 'canEditAnswer').and.returnValue(true);
        component.handleKeyUp(mockEvent);
        expect(mockEvent.stopPropagation).toHaveBeenCalled();
        expect(component.confirmAnswer).not.toHaveBeenCalled();
        expect(component.isChecked).toEqual([true, true, false, false]);
    });

    it('handleKeyUp should do nothing if an invalid number key is pressed', () => {
        const mockEvent = new KeyboardEvent('keyup', { key: '5' });
        spyOn(mockEvent, 'stopPropagation');
        spyOn(component, 'confirmAnswer');
        spyOnProperty(questionHandlerServiceSpy, 'currentQuestion', 'get').and.returnValue(QUESTIONS_DATA[0]);
        spyOn(component, 'canEditAnswer').and.returnValue(true);
        component.handleKeyUp(mockEvent);
        expect(mockEvent.stopPropagation).toHaveBeenCalled();
        expect(component.confirmAnswer).not.toHaveBeenCalled();
        expect(component.isChecked).toBe(TEST_PLAYER.answer);
    });

    it('canEditAnswer should return false if answer is confirmed', () => {
        component.player.answerConfirmed = true;
        const showingAnswerSpy = spyOnProperty(component, 'showingAnswer', 'get').and.returnValue(false);
        expect(component.canEditAnswer()).toBeFalse();
        showingAnswerSpy.and.returnValue(true);
        expect(component.canEditAnswer()).toBeFalse();
    });

    it('canEditAnswer should return false if showingAnswer is true', () => {
        spyOnProperty(component, 'showingAnswer', 'get').and.returnValue(true);
        component.player.answerConfirmed = false;
        expect(component.canEditAnswer()).toBeFalse();
        component.player.answerConfirmed = true;
        expect(component.canEditAnswer()).toBeFalse();
    });

    it('canEditAnswer should return true if answer is not confirmed and showingAnswer is false', () => {
        spyOnProperty(component, 'showingAnswer', 'get').and.returnValue(false);
        component.player.answerConfirmed = false;
        expect(component.canEditAnswer()).toBeTrue();
    });

    it('confirmAnswer should call confirmAnswer on player and set answerConfirmed to true', () => {
        spyOn(component.player, 'confirmAnswer');
        component.confirmAnswer();
        expect(component.player.confirmAnswer).toHaveBeenCalled();
        expect(component.player.answerConfirmed).toBeTrue();
    });
});
