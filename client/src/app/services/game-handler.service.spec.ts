import { TestBed } from '@angular/core/testing';
import { Player } from '@app/interfaces/player';

import { GameHandlerService, GameState, TEST_GAME, SHOW_ANSWER_DELAY } from '@app/services/game-handler.service';
import { PlayerHandlerService } from '@app/services/player-handler.service';
import { BehaviorSubject, Subject } from 'rxjs';
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

        playerHandlerServiceSpy = jasmine.createSpyObj('PlayerHandlerService', []);

        questionHandlerServiceSpy = jasmine.createSpyObj('QuestionHandlerService', [
            'currentQuestion',
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

    it('startGame should call createAnswerSubscription for each player', () => {
        const mockPlayers: Map<number, Player> = new Map<number, Player>(
            [0, 1, 2].map((id) => [id, { score: 0, answerNotifier: new Subject<boolean[]>() }]),
        );
        spyOnProperty(playerHandlerServiceSpy, 'players', 'get').and.returnValue(mockPlayers);
        service['confirmSubscriptions'] = [];
        service.startGame();

        expect(service.createAnswerSubscription).toHaveBeenCalledTimes(mockPlayers.size);
        mockPlayers.forEach((player) => {
            expect(service.createAnswerSubscription).toHaveBeenCalledWith(player);
        });
    });

    it('startGame should call createQuestionTimer with the correct callback', () => {
        spyOn<any>(service, 'showAnswer');
        service.startGame();

        expect(gameTimerServiceSpy.createQuestionTimer).toHaveBeenCalledWith(service['showAnswer']);
    });

    it('startGame should call createAnswerTimer with the correct callback', () => {
        spyOn<any>(service, 'setUpNextQuestion');
        service.startGame();

        expect(gameTimerServiceSpy.createAnswerTimer).toHaveBeenCalledWith(service['setUpNextQuestion']);
    });
});
