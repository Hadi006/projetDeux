import { discardPeriodicTasks, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { Player } from '@app/interfaces/player';

import { GameHandlerService, GameState, TEST_GAME, SHOW_ANSWER_DELAY } from '@app/services/game-handler.service';
import { PlayerHandlerService } from '@app/services/player-handler.service';
// import { QuestionData } from '@common/question-data';
import { /* BehaviorSubject, Subject, */ Subscription } from 'rxjs';
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

    it('get time should call getQuestionTime when the game state is ShowQuestion and return its value', () => {
        const TIME = 10;
        gameTimerServiceSpy.getQuestionTime.and.returnValue(TIME);
        spyOnProperty(questionHandlerServiceSpy, 'currentQuestion', 'get').and.returnValue(TEST_GAME.questions[0]);
        service.startGame();

        expect(service.time).toEqual(TIME);
        expect(gameTimerServiceSpy.getQuestionTime).toHaveBeenCalled();
    });

    it('get time should call getAnswerTime when the game state is ShowAnswer and return its value', fakeAsync(() => {
        const TIME = 10;
        const TIME_MS = 1000;
        gameTimerServiceSpy.getAnswerTime.and.returnValue(TIME);
        spyOnProperty(questionHandlerServiceSpy, 'currentQuestion', 'get').and.returnValue(TEST_GAME.questions[0]);
        gameTimerServiceSpy.createQuestionTimer.and.callThrough();
        gameTimerServiceSpy.startQuestionTimer.and.callThrough();
        service.startGame();
        tick((TEST_GAME.timePerQuestion + 1) * TIME_MS);

        expect(service.time).toEqual(TIME);
        expect(gameTimerServiceSpy.getAnswerTime).toHaveBeenCalled();
        discardPeriodicTasks();
    }));

    it('get time should return 0 when the game state is GameEnded', () => {
        service.startGame();

        expect(service.time).toEqual(0);
    });

    it('get time should return undefined when the game state is not recognized', () => {
        expect(service.time).toBeUndefined();
    });

    describe('createQuestionTimer within startGame', () => {
        const ANSWER_TIME = 10;

        let observedState: GameState | undefined;
        let gameStateSubscriber: Subscription;

        beforeEach(fakeAsync(() => {
            gameTimerServiceSpy.getAnswerTime.and.returnValue(ANSWER_TIME);
            gameStateSubscriber = service.stateSubject.subscribe((state) => {
                observedState = state;
            });
            service.startGame();
            tick(TEST_GAME.timePerQuestion);
        }));

        it('should call createQuestionTimer', fakeAsync(() => {
            expect(gameTimerServiceSpy.createQuestionTimer).toHaveBeenCalled();
        }));

        it('should notify subscribers of the correct GameState', fakeAsync(() => {
            expect(observedState).toEqual(GameState.ShowAnswer);
        }));

        it('should cause time to return answer time', fakeAsync(() => {
            expect(service.time).toEqual(ANSWER_TIME);
        }));

        it('should call startAnswerTimer with SHOW_ANSWER_DELAY', fakeAsync(() => {
            expect(gameTimerServiceSpy.startAnswerTimer).toHaveBeenCalledWith(SHOW_ANSWER_DELAY);
        }));

        afterEach(fakeAsync(() => {
            gameStateSubscriber.unsubscribe();
            discardPeriodicTasks();
        }));
    });

    describe('createAnswerTimer within startGame', () => {
        // const QUESTION_TIME = 5;

        let observedState: GameState | undefined;
        let gameStateSubscriber: Subscription;

        beforeEach(fakeAsync(() => {
            service.startGame();
            gameStateSubscriber = service.stateSubject.subscribe((state) => {
                observedState = state;
            });
            tick(TEST_GAME.timePerQuestion);
            tick(SHOW_ANSWER_DELAY);
        }));

        it('should call createAnswerTimer', fakeAsync(() => {
            expect(gameTimerServiceSpy.createAnswerTimer).toHaveBeenCalled();
        }));

        it('should call questionHandlerService.nextQuestion', fakeAsync(() => {
            expect(questionHandlerServiceSpy.nextQuestion).toHaveBeenCalled();
        }));

        it('should notify subscribers of the correct GameState if there are more questions', fakeAsync(() => {
            expect(observedState).toEqual(GameState.ShowQuestion);
        }));

        afterEach(fakeAsync(() => {
            discardPeriodicTasks();
            gameStateSubscriber.unsubscribe();
        }));
    });

    it('should call createAnswerTimer', () => {
        expect(gameTimerServiceSpy.createAnswerTimer).toHaveBeenCalled();
    });

    it('should call getGameData', () => {
        expect(service['gameData']).toEqual(TEST_GAME);
    });

    it('should call setUpNextQuestion', () => {
        expect(questionHandlerServiceSpy.nextQuestion).toHaveBeenCalled();
    });
});
