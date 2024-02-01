import { TestBed } from '@angular/core/testing';

import { GameHandlerService, TEST_GAME, SHOW_ANSWER_DELAY } from '@app/services/game-handler.service';
import { QuestionData } from '@common/question-data';
import { QuestionHandlerService } from '@app/services/question-handler.service';
import { GameTimersService } from '@app/services/game-timers.service';
import { GameStateService, GameState } from '@app/services/game-state.service';
import { Subject } from 'rxjs';

describe('GameHandlerService', () => {
    let service: GameHandlerService;
    let questionHandlerServiceSpy: jasmine.SpyObj<QuestionHandlerService>;
    let questionsData: QuestionData[];
    let gameTimersServiceSpy: jasmine.SpyObj<GameTimersService>;
    let gameStateService: GameStateService;
    let mockSubject: Subject<void>;

    beforeEach(() => {
        questionHandlerServiceSpy = jasmine.createSpyObj<QuestionHandlerService>('QuestionHandlerService', [
            'nextQuestion',
            'resetPlayerAnswers',
            'questionsData',
        ]);
        Object.defineProperty(questionHandlerServiceSpy, 'questionsData', {
            set: (data) => {
                questionsData = data;
            },
            configurable: true,
        });

        gameTimersServiceSpy = jasmine.createSpyObj<GameTimersService>('GameTimersService', [
            'startQuestionTimer',
            'startAnswerTimer',
            'stopQuestionTimer',
            'timerEndedSubject',
        ]);
        mockSubject = new Subject<void>();
        Object.defineProperty(gameTimersServiceSpy, 'timerEndedSubject', {
            get: () => {
                return mockSubject;
            },
            configurable: true,
        });
    });

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [
                { provide: QuestionHandlerService, useValue: questionHandlerServiceSpy },
                { provide: GameTimersService, useValue: gameTimersServiceSpy },
                GameStateService,
            ],
        });
        service = TestBed.inject(GameHandlerService);
        gameStateService = TestBed.inject(GameStateService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should call setUpNextState when time has ended', () => {
        spyOn(service, 'setUpNextState');
        gameTimersServiceSpy.timerEndedSubject.next();
        expect(service.setUpNextState).toHaveBeenCalled();
    });

    it('loadGameData should load the correct game', () => {
        // TODO - mock the server response
        service.loadGameData();
        expect(service.gameData).toEqual(TEST_GAME);
    });

    it('startGame should set questionsData, reset player answers and start question timer with the correct value', () => {
        // TODO - mock the server response
        service.loadGameData();
        service.startGame();
        expect(questionsData).toEqual(TEST_GAME.questions);
        expect(questionHandlerServiceSpy.resetPlayerAnswers).toHaveBeenCalled();
        expect(gameTimersServiceSpy.startQuestionTimer).toHaveBeenCalledWith(TEST_GAME.timePerQuestion);
    });

    it('setUpNextState should set the game correctly if state is show question', () => {
        gameStateService.gameState = GameState.ShowQuestion;
        expect(gameStateService.gameState).toBe(GameState.ShowQuestion);
        service.setUpNextState();
        expect(gameTimersServiceSpy.startAnswerTimer).toHaveBeenCalledWith(SHOW_ANSWER_DELAY);
        // expect(gameStateService.gameState).toBe(GameState.ShowAnswer);
    });

    it('setUpNextState should set the game correctly if state is show answer and the next question exists', () => {
        gameStateService.gameState = GameState.ShowAnswer;
        questionHandlerServiceSpy.questionsData = TEST_GAME.questions;
        service.setUpNextState();
        expect(gameTimersServiceSpy.startQuestionTimer).toHaveBeenCalledWith(TEST_GAME.timePerQuestion);
        // expect(gameStateService.gameState).toBe(GameState.ShowQuestion);
    });

    it('setUpNextState should set the game correctly if state is show answer and the next question does not exist', () => {
        gameStateService.gameState = GameState.ShowAnswer;
        questionHandlerServiceSpy.questionsData = [];
        service.setUpNextState();
        // expect(gameStateService.gameState).toBe(GameState.GameEnded);
    });

    it('setUpNextState should set the game correctly if the state is not show answer or show question', () => {
        gameStateService.gameState = GameState.GameEnded;
        service.setUpNextState();
        expect(gameStateService.gameState).toBe(GameState.GameEnded);
        const unrecognizedState = 100;
        gameStateService.gameState = unrecognizedState;
        expect(gameStateService.gameState).toBe(GameState.GameEnded);
    });

    it('cleanUp should unsubscribe from timer ended', () => {
        spyOn(service, 'setUpNextState');
        service.cleanUp();
        gameTimersServiceSpy.timerEndedSubject.next();
        expect(service.setUpNextState).not.toHaveBeenCalled();
    });
});
