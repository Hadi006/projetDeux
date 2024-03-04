import { TestBed } from '@angular/core/testing';
import { GameState } from '@common/constant';
import { Subject } from 'rxjs';
import { GameManagementService } from './game-management.service';
import { PlayerHandlerService } from './player-handler.service';
import { TimeService } from './time.service';

describe('GameTimersService', () => {
    const QUESTION_TIMER_ID = 0;
    const ANSWER_TIMER_ID = 1;
    const TIME = 10;

    let service: GameManagementService;
    let timeServiceSpy: jasmine.SpyObj<TimeService>;
    let playerHandlerServiceSpy: jasmine.SpyObj<PlayerHandlerService>;
    let mockSubject: Subject<void>;

    beforeEach(() => {
        timeServiceSpy = jasmine.createSpyObj('TimeService', ['createTimerById', 'startTimerById', 'stopTimerById', 'getTimeById', 'setTimeById']);
        timeServiceSpy.createTimerById.and.returnValues(QUESTION_TIMER_ID, ANSWER_TIMER_ID);

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
            ],
        });
        service = TestBed.inject(GameManagementService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should create 2 timers', () => {
        expect(timeServiceSpy.createTimerById).toHaveBeenCalledTimes(2);
    });

    it('should stop question timer when all players have answered', () => {
        spyOn(service, 'stopQuestionTimer');
        playerHandlerServiceSpy.allAnsweredSubject.next();
        expect(service.stopQuestionTimer).toHaveBeenCalled();
    });

    it('time getter should return the correct value when game state is ShowQuestion', () => {
        service.gameState = GameState.ShowQuestion;
        timeServiceSpy.getTimeById.and.returnValue(TIME);
        expect(service.time).toBe(TIME);
        expect(timeServiceSpy.getTimeById).toHaveBeenCalledWith(QUESTION_TIMER_ID);
    });

    it('time getter should return the correct value when game state is ShowAnswer', () => {
        const time = 10;
        service.gameState = GameState.ShowAnswer;
        timeServiceSpy.getTimeById.and.returnValue(time);
        expect(service.time).toBe(time);
        expect(timeServiceSpy.getTimeById).toHaveBeenCalledWith(ANSWER_TIMER_ID);
    });

    it('time getter should return 0 when game state is GameEnded', () => {
        service.gameState = GameState.GameEnded;
        expect(service.time).toBe(0);
        expect(timeServiceSpy.getTimeById).not.toHaveBeenCalled();
    });

    it('time getter should return 0 when game state is not recognized', () => {
        const unrecognizedState = 100;
        service.gameState = unrecognizedState;
        expect(service.time).toBe(0);
        expect(timeServiceSpy.getTimeById).not.toHaveBeenCalled();
    });

    it('startQuestionTimer should start the timer with the correct id', () => {
        service.startQuestionTimer(TIME);
        expect(timeServiceSpy.startTimerById).toHaveBeenCalledWith(QUESTION_TIMER_ID, TIME);
    });

    it('startAnswerTimer should start the timer with the correct id', () => {
        service.startAnswerTimer(TIME);
        expect(timeServiceSpy.startTimerById).toHaveBeenCalledWith(ANSWER_TIMER_ID, TIME);
    });

    it('stopQuestionTimer should stop the timer and notify subscribers', () => {
        spyOn(service.timerEndedSubject, 'next');
        service.stopQuestionTimer();
        expect(timeServiceSpy.stopTimerById).toHaveBeenCalledWith(QUESTION_TIMER_ID);
        expect(service.timerEndedSubject.next).toHaveBeenCalled();
    });

    it('stopAnswerTimer should stop the timer and notify subscribers', () => {
        spyOn(service.timerEndedSubject, 'next');
        service.stopAnswerTimer();
        expect(timeServiceSpy.stopTimerById).toHaveBeenCalledWith(ANSWER_TIMER_ID);
        expect(service.timerEndedSubject.next).toHaveBeenCalled();
    });

    it('ngOnDestroy should unsubscribe from allAnsweredSubject', () => {
        spyOn(service, 'stopQuestionTimer');
        service.ngOnDestroy();
        playerHandlerServiceSpy.allAnsweredSubject.next();
        expect(service.stopQuestionTimer).not.toHaveBeenCalled();
    });
});
