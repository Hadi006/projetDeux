import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { PlayerHandlerService } from '@app/services/player-handler.service';
import { Question } from '@common/quiz';
import { QuestionComponent } from './question.component';
import { of } from 'rxjs';
import { Player } from '@common/player';

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

    const TEST_PLAYER: Player = {
        name: 'Player 1',
        score: 0,
        questions: [...QUESTIONS_DATA],
    };

    let component: QuestionComponent;
    let fixture: ComponentFixture<QuestionComponent>;
    let playerHandlerServiceSpy: jasmine.SpyObj<PlayerHandlerService>;

    beforeEach(() => {
        playerHandlerServiceSpy = jasmine.createSpyObj<PlayerHandlerService>('PlayerHandlerService', [
            'createPlayer',
            'handleKeyUp',
            'getPlayerBooleanAnswers',
        ]);
        playerHandlerServiceSpy.createPlayer.and.returnValue(of(''));
        Object.defineProperty(playerHandlerServiceSpy, 'answerConfirmed', {
            get: () => {
                return false;
            },
            configurable: true,
        });
    });

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule({
            declarations: [QuestionComponent],
            providers: [{ provide: PlayerHandlerService, useValue: playerHandlerServiceSpy }],
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

    it('handleKeyUp should do nothing if there is no player', () => {
        const mockEvent = new KeyboardEvent('keyup');
        spyOn(mockEvent, 'stopPropagation');
        spyOn(component, 'getPlayer').and.returnValue(undefined);
        component.handleKeyUp(mockEvent);
        expect(mockEvent.stopPropagation).not.toHaveBeenCalled();
        expect(playerHandlerServiceSpy.handleKeyUp).not.toHaveBeenCalled();
    });

    it('handleKeyUp should do nothing if question is open ended', () => {
        const mockEvent = new KeyboardEvent('keyup');
        spyOn(mockEvent, 'stopPropagation');
        spyOn(component, 'getPlayer').and.returnValue({ ...TEST_PLAYER });
        spyOn(component, 'getQuestionData').and.returnValue(QUESTIONS_DATA[1]);
        component.handleKeyUp(mockEvent);
        expect(mockEvent.stopPropagation).not.toHaveBeenCalled();
        expect(playerHandlerServiceSpy.handleKeyUp).not.toHaveBeenCalled();
    });

    it('handleKeyUp should do nothing if answer is confirmed', () => {
        const mockEvent = new KeyboardEvent('keyup');
        spyOn(mockEvent, 'stopPropagation');
        spyOn(component, 'getPlayer').and.returnValue({ ...TEST_PLAYER });
        spyOnProperty(playerHandlerServiceSpy, 'answerConfirmed', 'get').and.returnValue(true);
        component.handleKeyUp(mockEvent);
        expect(mockEvent.stopPropagation).not.toHaveBeenCalled();
        expect(playerHandlerServiceSpy.handleKeyUp).not.toHaveBeenCalled();
    });

    it('handleKeyUp should call playerHandlerService.handleKeyUp', () => {
        const mockEvent = new KeyboardEvent('keyup');
        spyOn(mockEvent, 'stopPropagation');
        spyOn(component, 'getQuestionData').and.returnValue(QUESTIONS_DATA[0]);
        spyOn(component, 'getPlayer').and.returnValue({ ...TEST_PLAYER });
        component.handleKeyUp(mockEvent);
        expect(mockEvent.stopPropagation).toHaveBeenCalled();
        expect(playerHandlerServiceSpy.handleKeyUp).toHaveBeenCalledWith(mockEvent);
    });

    it('getPlayer should return the player', () => {
        playerHandlerServiceSpy.player = { ...TEST_PLAYER };
        expect(component.getPlayer()).toEqual(TEST_PLAYER);
    });

    it('getQuestionData should return currentQuestion', () => {
        spyOn(component, 'getPlayer').and.returnValue({ ...TEST_PLAYER });
        expect(component.getQuestionData()).toBe(QUESTIONS_DATA[1]);
    });

    it('getQuestionData should return undefined if there is no player', () => {
        spyOn(component, 'getPlayer').and.returnValue(undefined);
        expect(component.getQuestionData()).toBeUndefined();
    });

    it('getIsChecked should return the players answer', () => {
        expect(component.getIsChecked()).toEqual(playerHandlerServiceSpy.getPlayerBooleanAnswers());
    });
});
