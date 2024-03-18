import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { PlayerService } from '@app/services/player.service';
import { Question } from '@common/quiz';
import { QuestionComponent } from './question.component';
import { of } from 'rxjs';
import { Player } from '@common/player';
import { TEST_PLAYERS, TEST_QUESTIONS } from '@common/constant';

describe('QuestionComponent', () => {
    let testQuestions: Question[];
    let testPlayer: Player;

    let component: QuestionComponent;
    let fixture: ComponentFixture<QuestionComponent>;
    let playerHandlerServiceSpy: jasmine.SpyObj<PlayerService>;

    beforeEach(() => {
        testQuestions = JSON.parse(JSON.stringify(TEST_QUESTIONS));
        testPlayer = JSON.parse(JSON.stringify(TEST_PLAYERS[0]));

        playerHandlerServiceSpy = jasmine.createSpyObj<PlayerService>('PlayerService', [
            'joinGame',
            'handleKeyUp',
            'getPlayerBooleanAnswers',
            'getTime',
            'leaveGame',
        ]);
        playerHandlerServiceSpy.joinGame.and.returnValue(of(''));
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
            providers: [{ provide: PlayerService, useValue: playerHandlerServiceSpy }],
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
        spyOn(component, 'getPlayer').and.returnValue(testPlayer);
        spyOn(component, 'getQuestionData').and.returnValue(testQuestions[1]);
        component.handleKeyUp(mockEvent);
        expect(mockEvent.stopPropagation).not.toHaveBeenCalled();
        expect(playerHandlerServiceSpy.handleKeyUp).not.toHaveBeenCalled();
    });

    it('handleKeyUp should do nothing if answer is confirmed', () => {
        const mockEvent = new KeyboardEvent('keyup');
        spyOn(mockEvent, 'stopPropagation');
        spyOn(component, 'getPlayer').and.returnValue(testPlayer);
        spyOnProperty(playerHandlerServiceSpy, 'answerConfirmed', 'get').and.returnValue(true);
        component.handleKeyUp(mockEvent);
        expect(mockEvent.stopPropagation).not.toHaveBeenCalled();
        expect(playerHandlerServiceSpy.handleKeyUp).not.toHaveBeenCalled();
    });

    it('handleKeyUp should call playerHandlerService.handleKeyUp', () => {
        const mockEvent = new KeyboardEvent('keyup');
        spyOn(mockEvent, 'stopPropagation');
        spyOn(component, 'getQuestionData').and.returnValue(testQuestions[0]);
        spyOn(component, 'getPlayer').and.returnValue(testPlayer);
        component.handleKeyUp(mockEvent);
        expect(mockEvent.stopPropagation).toHaveBeenCalled();
        expect(playerHandlerServiceSpy.handleKeyUp).toHaveBeenCalledWith(mockEvent);
    });

    it('getPlayer should return the player', () => {
        playerHandlerServiceSpy.player = { ...testPlayer };
        expect(component.getPlayer()).toEqual(testPlayer);
    });

    it('getQuestionData should return currentQuestion', () => {
        spyOn(component, 'getPlayer').and.returnValue(testPlayer);
        expect(component.getQuestionData()).toEqual(testQuestions[testPlayer.questions.length - 1]);
    });

    it('getQuestionData should return undefined if there is no player', () => {
        spyOn(component, 'getPlayer').and.returnValue(undefined);
        expect(component.getQuestionData()).toBeUndefined();
    });

    it('getIsChecked should return the players answer', () => {
        expect(component.getIsChecked()).toEqual(playerHandlerServiceSpy.getPlayerBooleanAnswers());
    });

    it('should call leaveGame on the playerService when leaveGame is called', () => {
        component.leaveGame();
        expect(playerHandlerServiceSpy.leaveGame).toHaveBeenCalled();
    });
});
