import { TestBed } from '@angular/core/testing';
import { Player } from '@app/interfaces/player';

import { GameHandlerService, GameState, TEST_GAME } from '@app/services/game-handler.service';
import { PlayerHandlerService } from '@app/services/player-handler.service';
import { GameTimersService } from './game-timers.service';
import { QuestionHandlerService } from './question-handler.service';

describe('GameHandlerService', () => {
    let service: GameHandlerService;
    let gameTimerServiceSpy: jasmine.SpyObj<GameTimersService>;
    let playerHandlerServiceSpy: jasmine.SpyObj<PlayerHandlerService>;
    let questionHandlerServiceSpy: jasmine.SpyObj<QuestionHandlerService>;

    beforeEach(() => {
        gameTimerServiceSpy = jasmine.createSpyObj('GameTimersService', [
            'createQuestionTimer',
            'createAnswerTimer',
            'startQuestionTimer',
            'startAnswerTimer',
            'getQuestionTime',
            'getAnswerTime',
            'setQuestionTime',
        ]);
        Object.defineProperty(gameTimerServiceSpy, 'questionTime', {
            get: () => {
                return 0;
            },
            configurable: true,
        });
        Object.defineProperty(gameTimerServiceSpy, 'answerTime', {
            get: () => {
                return 0;
            },
            configurable: true,
        });

        playerHandlerServiceSpy = playerHandlerServiceSpy = jasmine.createSpyObj<PlayerHandlerService>('PlayerHandlerService', [], {
            players: new Map<number, Player>(),
            nPlayers: 0,
        });

        questionHandlerServiceSpy = jasmine.createSpyObj<QuestionHandlerService>('QuestionHandlerService', [
            'setQuestions',
            'nextQuestion',
            'calculateScore',
        ]);
        Object.defineProperty(questionHandlerServiceSpy, 'currentQuestion', {
            get: () => {
                return undefined;
            },
            configurable: true,
        });
    });

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [
                { provide: GameTimersService, useValue: gameTimerServiceSpy },
                { provide: PlayerHandlerService, useValue: playerHandlerServiceSpy },
                { provide: QuestionHandlerService, useValue: questionHandlerServiceSpy },
            ],
        });
        service = TestBed.inject(GameHandlerService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('get time should return the correct value when game state is ShowQuestion', () => {
        const TIME = 10;
        spyOnProperty(gameTimerServiceSpy, 'questionTime', 'get').and.returnValue(TIME);
        questionHandlerServiceSpy.setQuestions.and.callThrough();
        questionHandlerServiceSpy.setQuestions(TEST_GAME.questions);
        service.updateGameState(GameState.ShowQuestion);

        expect(service.time).toEqual(TIME);
    });

    it('get time should call getAnswerTime when the game state is ShowAnswer and return its value', () => {
        const TIME = 10;
        spyOnProperty(gameTimerServiceSpy, 'answerTime', 'get').and.returnValue(TIME);
        questionHandlerServiceSpy.setQuestions.and.callThrough();
        questionHandlerServiceSpy.setQuestions(TEST_GAME.questions);
        service.updateGameState(GameState.ShowAnswer);

        expect(service.time).toEqual(TIME);
    });

    it('get time should return 0 when the game state is GameEnded', () => {
        service.startGame();

        expect(service.time).toEqual(0);
    });

    it('get time should return undefined when the game state is not recognized', () => {
        expect(service.time).toBeUndefined();
    });
});
