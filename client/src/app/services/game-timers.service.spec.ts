import { TestBed } from '@angular/core/testing';
import { GameStateService, GameState } from './game-state.service';

import { GameTimersService } from './game-timers.service';
import { TimeService } from './time.service';

describe('GameTimersService', () => {
    const QUESTION_TIMER_ID = 0;
    const ANSWER_TIMER_ID = 1;

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
});
