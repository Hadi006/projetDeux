import { TestBed } from '@angular/core/testing';
import { GameStateService, GameState } from '@app/services/game-state.service';

import { GameTimersService } from '@app/services/game-timers.service';
import { Subject } from 'rxjs';
import { PlayerHandlerService } from './player-handler.service';
import { TimeService } from './time.service';

describe('GameTimersService', () => {
    const QUESTION_TIMER_ID = 0;
    const ANSWER_TIMER_ID = 1;
    const TIME = 10;

    let service: GameTimersService;
    let timeServiceSpy: jasmine.SpyObj<TimeService>;
    let gameStateService: GameStateService;
    let playerHandlerServiceSpy: jasmine.SpyObj<PlayerHandlerService>;
    let mockSubject: Subject<void>;

    beforeEach(() => {
        timeServiceSpy = jasmine.createSpyObj('TimeService', ['createTimer', 'startTimer', 'stopTimer', 'getTime', 'setTime']);
        timeServiceSpy.createTimer.and.returnValues(QUESTION_TIMER_ID, ANSWER_TIMER_ID);

        playerHandlerServiceSpy = jasmine.createSpyObj('PlayerHandlerService', ['allAnsweredSubject']);
        mockSubject = new Subject<void>();
        Object.defineProperty(playerHandlerServiceSpy, 'allAnsweredSubject', {
            get: () => {
                return mockSubject;
            },
            configurable: true,
        });
    });

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [
                { provide: TimeService, useValue: timeServiceSpy },
                { provide: PlayerHandlerService, useValue: playerHandlerServiceSpy },
                GameStateService,
            ],
        });
        service = TestBed.inject(GameTimersService);
        gameStateService = TestBed.inject(GameStateService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should create 2 timers', () => {
        expect(timeServiceSpy.createTimer).toHaveBeenCalledTimes(2);
    });

    it('should stop question timer when all players have answered', () => {
        spyOn(service, 'stopQuestionTimer');
        playerHandlerServiceSpy.allAnsweredSubject.next();
        expect(service.stopQuestionTimer).toHaveBeenCalled();
    });

    it('time getter should return the correct value when game state is ShowQuestion', () => {
        gameStateService.gameState = GameState.ShowQuestion;
        timeServiceSpy.getTime.and.returnValue(TIME);
        expect(service.time).toBe(TIME);
        expect(timeServiceSpy.getTime).toHaveBeenCalledWith(QUESTION_TIMER_ID);
    });

    it('time getter should return the correct value when game state is ShowAnswer', () => {
        const time = 10;
        gameStateService.gameState = GameState.ShowAnswer;
        timeServiceSpy.getTime.and.returnValue(time);
        expect(service.time).toBe(time);
        expect(timeServiceSpy.getTime).toHaveBeenCalledWith(ANSWER_TIMER_ID);
    });

    it('time getter should return 0 when game state is GameEnded', () => {
        gameStateService.gameState = GameState.GameEnded;
        expect(service.time).toBe(0);
        expect(timeServiceSpy.getTime).not.toHaveBeenCalled();
    });

    it('time getter should return 0 when game state is not recognized', () => {
        const unrecognizedState = 100;
        gameStateService.gameState = unrecognizedState;
        expect(service.time).toBe(0);
        expect(timeServiceSpy.getTime).not.toHaveBeenCalled();
    });

    it('startQuestionTimer should start the timer with the correct id', () => {
        service.startQuestionTimer(TIME);
        expect(timeServiceSpy.startTimer).toHaveBeenCalledWith(QUESTION_TIMER_ID, TIME);
    });

    it('startAnswerTimer should start the timer with the correct id', () => {
        service.startAnswerTimer(TIME);
        expect(timeServiceSpy.startTimer).toHaveBeenCalledWith(ANSWER_TIMER_ID, TIME);
    });

    it('stopQuestionTimer should stop the timer and notify subscribers', () => {
        spyOn(service.timerEndedSubject, 'next');
        service.stopQuestionTimer();
        expect(timeServiceSpy.stopTimer).toHaveBeenCalledWith(QUESTION_TIMER_ID);
        expect(service.timerEndedSubject.next).toHaveBeenCalled();
    });

    it('stopAnswerTimer should stop the timer and notify subscribers', () => {
        spyOn(service.timerEndedSubject, 'next');
        service.stopAnswerTimer();
        expect(timeServiceSpy.stopTimer).toHaveBeenCalledWith(ANSWER_TIMER_ID);
        expect(service.timerEndedSubject.next).toHaveBeenCalled();
    });

    it('cleanUp should unsubscribe from allAnsweredSubject', () => {
        spyOn(service, 'stopQuestionTimer');
        service.cleanUp();
        playerHandlerServiceSpy.allAnsweredSubject.next();
        expect(service.stopQuestionTimer).not.toHaveBeenCalled();
    });
});
