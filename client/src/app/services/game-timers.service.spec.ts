import { TestBed } from '@angular/core/testing';
import { GameStateService, GameState } from '@app/services/game-state.service';

import { GameTimersService, QUESTION_DELAY, ANSWER_DELAY } from '@app/services/game-timers.service';
import { QuestionHandlerService } from '@app/services/question-handler.service';
import { TimeService } from './time.service';

describe('GameTimersService', () => {
    const QUESTION_TIMER_ID = 0;
    const ANSWER_TIMER_ID = 1;

    let service: GameTimersService;
    let timeServiceSpy: jasmine.SpyObj<TimeService>;
    let gameStateService: GameStateService;
    let questionHandlerServiceSpy: jasmine.SpyObj<QuestionHandlerService>;

    beforeEach(() => {
        timeServiceSpy = jasmine.createSpyObj('TimeService', ['createTimer', 'startTimer', 'stopTimer', 'getTime', 'setTime']);
        timeServiceSpy.createTimer.and.returnValues(QUESTION_TIMER_ID, ANSWER_TIMER_ID);

        questionHandlerServiceSpy = jasmine.createSpyObj('QuestionHandlerService', ['nextQuestion']);
    });

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [
                { provide: TimeService, useValue: timeServiceSpy },
                { provide: QuestionHandlerService, useValue: questionHandlerServiceSpy },
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

    it('time getter should return the correct value when game state is ShowQuestion', () => {
        const time = 10;
        gameStateService.gameState = GameState.ShowQuestion;
        timeServiceSpy.getTime.and.returnValue(time);
        expect(service.time).toBe(time);
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
        service.startQuestionTimer(QUESTION_DELAY);
        expect(timeServiceSpy.startTimer).toHaveBeenCalledWith(QUESTION_TIMER_ID, QUESTION_DELAY);
    });

    it('startAnswerTimer should start the timer with the correct id', () => {
        service.startAnswerTimer(ANSWER_DELAY);
        expect(timeServiceSpy.startTimer).toHaveBeenCalledWith(ANSWER_TIMER_ID, ANSWER_DELAY);
    });

    it('stopQuestionTimer should set state and startAnswerTimer and stop its timer', () => {
        service.stopQuestionTimer();
        expect(gameStateService.gameState).toBe(GameState.ShowAnswer);
        expect(timeServiceSpy.startTimer).toHaveBeenCalledWith(ANSWER_TIMER_ID, ANSWER_DELAY);
        expect(timeServiceSpy.stopTimer).toHaveBeenCalledWith(QUESTION_TIMER_ID);
    });

    it('stopAnswerTimer should load next question, set state, startQuestionTimer and stop its timer', () => {
        service.stopAnswerTimer();
        expect(gameStateService.gameState).toBe(GameState.ShowQuestion);
        expect(questionHandlerServiceSpy.nextQuestion).toHaveBeenCalled();
        expect(timeServiceSpy.startTimer).toHaveBeenCalledWith(QUESTION_TIMER_ID, QUESTION_DELAY);
        expect(timeServiceSpy.stopTimer).toHaveBeenCalledWith(ANSWER_TIMER_ID);
    });
});
