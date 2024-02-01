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
        questionHandlerServiceSpy = jasmine.createSpyObj<QuestionHandlerService>('QuestionHandlerService', ['resetPlayerAnswers', 'questionsData']);
        Object.defineProperty(questionHandlerServiceSpy, 'questionsData', {
            set: (data) => {
                questionsData = data;
            },
            configurable: true,
        });

        mockSubject = new Subject();
        spyOn(mockSubject, 'next').and.callThrough();
        gameTimersServiceSpy = jasmine.createSpyObj<GameTimersService>('GameTimersService', [
            'startQuestionTimer',
            'stopQuestionTimer',
            'timerEndedSubject',
        ]);
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
        mockSubject.next();
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

    it('setUpNextState should start the answer timer with the correct value and set state to show answer if state is show question', () => {
        gameStateService.gameState = GameState.ShowQuestion;
        expect(gameStateService.gameState).toBe(GameState.ShowQuestion);
        service.setUpNextState();
        expect(gameTimersServiceSpy.startAnswerTimer).toHaveBeenCalledWith(SHOW_ANSWER_DELAY);
        expect(gameStateService.gameState).toBe(GameState.ShowAnswer);
    });

    it('cleanup should unsubscribe from timer ended', () => {
        spyOn(mockSubject, 'unsubscribe');
        service.cleanup();
        expect(mockSubject.unsubscribe).toHaveBeenCalled();
    });
});
