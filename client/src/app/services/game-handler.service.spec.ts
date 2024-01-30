import { TestBed } from '@angular/core/testing';
import { Player } from '@app/interfaces/player';

import { GameHandlerService, GameState, TEST_GAME, SHOW_ANSWER_DELAY } from '@app/services/game-handler.service';
import { PlayerHandlerService } from '@app/services/player-handler.service';
import { BehaviorSubject } from 'rxjs';
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

        playerHandlerServiceSpy = jasmine.createSpyObj('PlayerHandlerService', ['get players', 'get nPlayers']);

        questionHandlerServiceSpy = jasmine.createSpyObj('QuestionHandlerService', [
            'get currentQuestion',
            'setQuestions',
            'nextQuestion',
            'calculateScore',
        ]);
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

    it('get data should return the correct value', () => {
        service['gameData'] = TEST_GAME;
        expect(service.data).toEqual(TEST_GAME);
    });

    it('get time should call getQuestionTime when the game state is ShowQuestion and return its value', () => {
        const TIME = 10;
        gameTimerServiceSpy.getQuestionTime.and.returnValue(TIME);
        service['gameState'] = GameState.ShowQuestion;

        expect(service.time).toEqual(TIME);
        expect(gameTimerServiceSpy.getQuestionTime).toHaveBeenCalled();
    });

    it('get time should call getAnswerTime when the game state is ShowAnswer and return its value', () => {
        const TIME = 10;
        gameTimerServiceSpy.getAnswerTime.and.returnValue(TIME);
        service['gameState'] = GameState.ShowAnswer;

        expect(service.time).toEqual(TIME);
        expect(gameTimerServiceSpy.getAnswerTime).toHaveBeenCalled();
    });

    it('get time should return 0 when the game state is GameEnded', () => {
        service['gameState'] = GameState.GameEnded;

        expect(service.time).toEqual(0);
    });

    it('get time should return 0 when the game state is not recognized', () => {
        service['gameState'] = 3;

        expect(service.time).toEqual(0);
    });

    it('get stateSubject should return the correct value', () => {
        service['gameStateSubject'] = new BehaviorSubject<GameState>(GameState.ShowQuestion);
        expect(service.stateSubject).toEqual(service['gameStateSubject']);
    });
});
