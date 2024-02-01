import { TestBed } from '@angular/core/testing';

import { GameHandlerService, GameState, QUESTIONS_DATA, TEST_GAME } from '@app/services/game-handler.service';
import { QuestionData } from '@common/question-data';
import { QuestionHandlerService } from './question-handler.service';

describe('GameHandlerService', () => {
    let service: GameHandlerService;
    let questionHandlerServiceSpy: jasmine.SpyObj<QuestionHandlerService>;
    let questionsData: QuestionData[];

    beforeEach(() => {
        questionHandlerServiceSpy = jasmine.createSpyObj<QuestionHandlerService>('QuestionHandlerService', ['currentQuestion', 'questionsData']);
        Object.defineProperty(questionHandlerServiceSpy, 'currentQuestion', {
            get: () => {
                return undefined;
            },
            configurable: true,
        });
        Object.defineProperty(questionHandlerServiceSpy, 'questionsData', {
            set: (data) => {
                questionsData = data;
            },
            configurable: true,
        });
    });

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [{ provide: QuestionHandlerService, useValue: questionHandlerServiceSpy }],
        });
        service = TestBed.inject(GameHandlerService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('nextState should set state to GameEnded if currentQuestion is undefined', () => {
        service.nextState();
        expect(service.gameState).toBe(GameState.GameEnded);
    });

    it('nextState should set the states in the correct order if currentQuestion is defined', () => {
        spyOnProperty(questionHandlerServiceSpy, 'currentQuestion', 'get').and.returnValue(QUESTIONS_DATA[0]);
        service.nextState();
        expect(service.gameState).toBe(GameState.ShowQuestion);
        service.nextState();
        expect(service.gameState).toBe(GameState.ShowAnswer);
        service.nextState();
        expect(service.gameState).toBe(GameState.ShowQuestion);
    });

    it('nextState should set state to GameEnded if current state is GameEnded', () => {
        service.nextState();
        spyOnProperty(questionHandlerServiceSpy, 'currentQuestion', 'get').and.returnValue(QUESTIONS_DATA[0]);
        service.nextState();
        expect(service.gameState).toBe(GameState.GameEnded);
    });

    it('loadGameData should load the correct game', () => {
        // TODO - mock the http request
        service.loadGameData();
        expect(service.gameData).toEqual(TEST_GAME);
    });

    it('startGame should set questionsData', () => {
        service.loadGameData();
        service.startGame();
        expect(questionsData).toEqual(TEST_GAME.questions);
    });
});
