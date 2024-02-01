import { TestBed } from '@angular/core/testing';
import { GameStateService, GameState } from './game-state.service';

import { GameTimersService } from './game-timers.service';
import { TimeService } from './time.service';

describe('GameTimersService', () => {
    let service: GameTimersService;
    let timeServiceSpy: jasmine.SpyObj<TimeService>;
    let gameStateServiceSpy: jasmine.SpyObj<GameStateService>;

    beforeEach(() => {
        timeServiceSpy = jasmine.createSpyObj('TimeService', ['createTimer', 'startTimer', 'stopTimer', 'getTime', 'setTime']);

        gameStateServiceSpy = jasmine.createSpyObj('GameStateService', ['nextState']);
        Object.defineProperty(gameStateServiceSpy, 'state', { get: () => 0, configurable: true });
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
});
