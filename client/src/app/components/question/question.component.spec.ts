import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { Player } from '@common/player';
import { PlayerHandlerService } from '@app/services/player-handler.service';
import { QuestionHandlerService } from '@app/services/question-handler.service';
import { GameState } from '@common/constant';
import { Question } from '@common/quiz';
import { QuestionComponent } from './question.component';
import { GameManagementService } from '@app/services/game-management.service';

const TEST_PLAYER: Player = {
    name: 'Player 1',
    score: 0,
    questions: [],
    answerConfirmed: false,
    isCorrect: false,
};

describe('QuestionComponent', () => {
    const QUESTIONS_DATA: Question[] = [
        {
            id: '0',
            points: 1,
            text: '1+1?',
            choices: [
                {
                    text: '1',
                    isCorrect: false,
                },
                {
                    text: '2',
                    isCorrect: true,
                },
                {
                    text: '3',
                    isCorrect: false,
                },
            ],
            type: 'QCM',
        },
        {
            id: '1',
            points: 1,
            text: 'What is the capital of France?',
            choices: [],
            type: 'QRL',
        },
    ];

    let component: QuestionComponent;
    let fixture: ComponentFixture<QuestionComponent>;
    let questionHandlerServiceSpy: jasmine.SpyObj<QuestionHandlerService>;
    let playerHandlerServiceSpy: jasmine.SpyObj<PlayerHandlerService>;
    let gameManagementServiceSpy: GameManagementService;

    beforeEach(() => {
        questionHandlerServiceSpy = jasmine.createSpyObj<QuestionHandlerService>('QuestionHandlerService', ['currentQuestion']);
        Object.defineProperty(questionHandlerServiceSpy, 'currentQuestion', {
            get: () => {
                return undefined;
            },
            configurable: true,
        });
        Object.defineProperty(questionHandlerServiceSpy, 'currentAnswers', {
            get: () => {
                return [];
            },
            configurable: true,
        });

        playerHandlerServiceSpy = jasmine.createSpyObj<PlayerHandlerService>('PlayerHandlerService', [
            'createPlayer',
            'handleKeyUp',
            'getPlayerBooleanAnswers',
        ]);
        playerHandlerServiceSpy.createPlayer.and.returnValue(TEST_PLAYER);

        gameManagementServiceSpy = {} as GameManagementService;
        gameManagementServiceSpy.gameState = GameState.ShowQuestion;
    });

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule({
            declarations: [QuestionComponent],
            providers: [
                { provide: QuestionHandlerService, useValue: questionHandlerServiceSpy },
                { provide: PlayerHandlerService, useValue: playerHandlerServiceSpy },
                { provide: GameManagementService, useValue: gameManagementServiceSpy },
            ],
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(QuestionComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('player should be created', () => {
        expect(playerHandlerServiceSpy.createPlayer).toHaveBeenCalled();
        expect(component.player).toEqual(TEST_PLAYER);
    });

    it('questionData getter should return currentQuestion', () => {
        spyOnProperty(questionHandlerServiceSpy, 'currentQuestion', 'get').and.returnValue(QUESTIONS_DATA[0]);
        expect(component.questionData).toBe(QUESTIONS_DATA[0]);
    });

    it('correctAnswers getter should return the correct answers', () => {
        spyOnProperty(questionHandlerServiceSpy, 'currentAnswers', 'get').and.returnValue([{ ...QUESTIONS_DATA[0].choices[1] }]);
        expect(component.correctAnswers).toEqual([QUESTIONS_DATA[0].choices[1]]);
    });

    it('isChecked getter should return the players answer', () => {
        expect(component.isChecked).toEqual(playerHandlerServiceSpy.getPlayerBooleanAnswers());
    });

    it('showingAnswer getter should return true when game state is ShowAnswer', () => {
        gameManagementServiceSpy.gameState = GameState.ShowAnswer;
        expect(component.showingAnswer).toBeTrue();
    });

    it('handleKeyUp should do nothing if there is no question data', () => {
        const mockEvent = new KeyboardEvent('keyup');
        spyOn(mockEvent, 'stopPropagation');
        component.handleKeyUp(mockEvent);
        expect(mockEvent.stopPropagation).not.toHaveBeenCalled();
        expect(playerHandlerServiceSpy.handleKeyUp).not.toHaveBeenCalled();
    });

    it('handleKeyUp should do nothing if question is open ended', () => {
        const mockEvent = new KeyboardEvent('keyup');
        spyOn(mockEvent, 'stopPropagation');
        spyOnProperty(questionHandlerServiceSpy, 'currentQuestion', 'get').and.returnValue(QUESTIONS_DATA[1]);
        component.handleKeyUp(mockEvent);
        expect(mockEvent.stopPropagation).not.toHaveBeenCalled();
        expect(playerHandlerServiceSpy.handleKeyUp).not.toHaveBeenCalled();
    });

    it('handleKeyUp should do nothing if answer cant be edited', () => {
        const mockEvent = new KeyboardEvent('keyup');
        spyOn(mockEvent, 'stopPropagation');
        spyOn(component, 'canEditAnswer').and.returnValue(false);
        component.handleKeyUp(mockEvent);
        expect(mockEvent.stopPropagation).not.toHaveBeenCalled();
        expect(playerHandlerServiceSpy.handleKeyUp).not.toHaveBeenCalled();
    });

    it('handleKeyUp should call playerHandlerService.handleKeyUp', () => {
        const mockEvent = new KeyboardEvent('keyup');
        spyOn(mockEvent, 'stopPropagation');
        spyOnProperty(questionHandlerServiceSpy, 'currentQuestion', 'get').and.returnValue(QUESTIONS_DATA[0]);
        spyOn(component, 'canEditAnswer').and.returnValue(true);
        component.handleKeyUp(mockEvent);
        expect(mockEvent.stopPropagation).toHaveBeenCalled();
        expect(playerHandlerServiceSpy.handleKeyUp).toHaveBeenCalledWith(mockEvent, TEST_PLAYER);
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
});
