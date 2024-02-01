import { discardPeriodicTasks, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { GameStateService, GameState } from './game-state.service';

import { GameTimersService, QUESTION_DELAY, ANSWER_DELAY } from './game-timers.service';
import { TimeService } from './time.service';

describe('GameTimersService', () => {
    const QUESTION_TIMER_ID = 0;
    const ANSWER_TIMER_ID = 1;
    const S_TO_MS = 1000;

    let service: GameTimersService;
    let timeServiceSpy: jasmine.SpyObj<TimeService>;
    let gameStateServiceSpy: jasmine.SpyObj<GameStateService>;

    beforeEach(() => {
        timeServiceSpy = jasmine.createSpyObj('TimeService', ['createTimer', 'startTimer', 'stopTimer', 'getTime', 'setTime']);
        timeServiceSpy.createTimer.and.returnValues(QUESTION_TIMER_ID, ANSWER_TIMER_ID);

        gameStateServiceSpy = jasmine.createSpyObj('GameStateService', ['nextState']);
        Object.defineProperty(gameStateServiceSpy, 'gameState', { get: () => 0, configurable: true });
    });

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [
                { provide: TimeService, useValue: timeServiceSpy },
                { provide: GameStateService, useValue: gameStateServiceSpy },
            ],
        });
        service = TestBed.inject(GameTimersService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should create 2 timers', () => {
        expect(timeServiceSpy.createTimer).toHaveBeenCalledTimes(2);
    });

    it('time getter should return the correct value when game state is ShowQuestion', () => {
        const time = 10;
        spyOnProperty(gameStateServiceSpy, 'gameState', 'get').and.returnValue(GameState.ShowQuestion);
        timeServiceSpy.getTime.and.returnValue(time);
        expect(service.time).toBe(time);
        expect(timeServiceSpy.getTime).toHaveBeenCalledWith(QUESTION_TIMER_ID);
    });

    it('time getter should return the correct value when game state is ShowAnswer', () => {
        const time = 10;
        spyOnProperty(gameStateServiceSpy, 'gameState', 'get').and.returnValue(GameState.ShowAnswer);
        timeServiceSpy.getTime.and.returnValue(time);
        expect(service.time).toBe(time);
        expect(timeServiceSpy.getTime).toHaveBeenCalledWith(ANSWER_TIMER_ID);
    });

    it('time getter should return 0 when game state is GameEnded', () => {
        spyOnProperty(gameStateServiceSpy, 'gameState', 'get').and.returnValue(GameState.GameEnded);
        expect(service.time).toBe(0);
        expect(timeServiceSpy.getTime).not.toHaveBeenCalled();
    });

    it('time getter should return 0 when game state is not recognized', () => {
        const unrecognizedState = 100;
        spyOnProperty(gameStateServiceSpy, 'gameState', 'get').and.returnValue(unrecognizedState);
        expect(service.time).toBe(0);
        expect(timeServiceSpy.getTime).not.toHaveBeenCalled();
    });

    it('startQuestionTimer should start the timer with the correct id', () => {
        service.startQuestionTimer(QUESTION_DELAY);
        expect(timeServiceSpy.startTimer).toHaveBeenCalledWith(QUESTION_TIMER_ID, QUESTION_DELAY * S_TO_MS);
    });
});
