import { ComponentFixture, TestBed, fakeAsync, waitForAsync } from '@angular/core/testing';
import { PlayerService } from '@app/services/player/player.service';
import { TEST_PLAYERS, TEST_QUESTIONS } from '@common/constant';
import { Player } from '@common/player';
import { Question } from '@common/quiz';
import { of } from 'rxjs';
import { QuestionComponent } from './question.component';

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
            'updatePlayer',
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

    it('getPlayer should return undefined if there is no player', () => {
        playerHandlerServiceSpy.player = null;
        expect(component.getPlayer()).toBeUndefined();
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
    it('should set lastModificationDate to current date', () => {
        const before = new Date().getTime();
        component.setLastModificationDate();
        const after = new Date().getTime();

        expect(component.lastModificationDate).toBeGreaterThanOrEqual(before);
        expect(component.lastModificationDate).toBeLessThanOrEqual(after);
    });

    it('should return the remaining length', () => {
        playerHandlerServiceSpy.player = {
            id: '1',
            name: 'John Doe',
            score: 0,
            fastestResponseCount: 0,
            isActive: false,
            questions: [
                {
                    text: 'Sample question',
                    type: 'QRL',
                    points: 10,
                    choices: [],
                    qrlAnswer: 'test',
                },
            ],
        };
        const length = component.getLength();
        expect(length).toBe(200 - 'test'.length);
    });

    it('should return 200 if qrlAnswer is empty string', () => {
        playerHandlerServiceSpy.player = {
            id: '1',
            name: 'John Doe',
            score: 0,
            fastestResponseCount: 0,
            isActive: false,
            questions: [
                {
                    text: 'Sample question',
                    type: 'QRL',
                    points: 10,
                    choices: [],
                    qrlAnswer: '',
                },
            ],
        };
        const length = component.getLength();
        expect(length).toBe(200);
    });

    it('should return 0 if qrlAnswer length is 200', () => {
        playerHandlerServiceSpy.player = {
            id: '1',
            name: 'John Doe',
            score: 0,
            fastestResponseCount: 0,
            isActive: false,
            questions: [
                {
                    text: 'Sample question',
                    type: 'QRL',
                    points: 10,
                    choices: [],
                    qrlAnswer: 'a'.repeat(200),
                },
            ],
        };
        const length = component.getLength();
        expect(length).toBe(0);
    });

    it('should update player isActive status and call updatePlayer if status changed', fakeAsync(() => {
        playerHandlerServiceSpy.player = {
            id: '1',
            name: 'John Doe',
            score: 0,
            fastestResponseCount: 0,
            questions: [
                {
                    type: 'QRL',
                    text: 'Sample question',
                    points: 10,
                    choices: [],
                    qrlAnswer: 'test',
                },
            ],
            isActive: false,
        };
        component.lastModificationDate = new Date(new Date().getTime() - 3000);

        // Act
        component.getTime();

        // Assert
        if (playerHandlerServiceSpy.player) {
            expect(playerHandlerServiceSpy.player.isActive).toBe(true);
        }
    }));
});
