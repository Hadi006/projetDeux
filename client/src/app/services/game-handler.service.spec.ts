import { TestBed } from '@angular/core/testing';

import { GameHandlerService, GameState } from '@app/services/game-handler.service';
import { PlayerHandlerService } from '@app/services/player-handler.service';
import { TimeService } from '@app/services/time.service';
import { Subject, Subscription } from 'rxjs';

const TIME_OUT = 5;
const SHOW_ANSWER_DELAY = 3;
const QUESTION_TIMER_INDEX = 0;
const ANSWER_TIMER_INDEX = 1;
const TIMER_IDS = [0, 1];
const QUESTION_DATA = [
    {
        id: 0,
        points: 1,
        question: '1+1?',
        answers: ['1', '2', '3', '4'],
        correctAnswers: ['2'],
        isMCQ: true,
    },
    {
        id: 1,
        points: 4,
        question: 'Open ended question',
        answers: [],
        correctAnswers: [],
        isMCQ: false,
    },
    {
        id: 2,
        points: 2,
        question: '2+2?',
        answers: ['1', '2', '3', '4'],
        correctAnswers: ['4'],
        isMCQ: true,
    },
];
const TEST_GAME = {
    id: 0,
    name: 'Math',
    questions: QUESTION_DATA,
    timePerQuestion: 10,
};

describe('GameHandlerService', () => {
    let service: GameHandlerService;
    let timerIdSequence: number;
    let timerCallback: () => void;
    let timeServiceSpy: jasmine.SpyObj<TimeService>;

    let answerConfirmedNotifiersSpy: Subject<void>[];
    let playerHandlerServiceSpy: jasmine.SpyObj<PlayerHandlerService>;

    beforeEach(() => {
        timeServiceSpy = jasmine.createSpyObj('TimeService', ['createTimer', 'getTime', 'startTimer', 'stopTimer', 'setTime']);
        timerIdSequence = 0;
        timeServiceSpy.createTimer.and.callFake((callback: () => void) => {
            timerCallback = callback;
            return timerIdSequence++;
        });

        answerConfirmedNotifiersSpy = [new Subject<void>(), new Subject<void>(), new Subject<void>()];
        playerHandlerServiceSpy = jasmine.createSpyObj('PlayerHandlerService', ['answerConfirmedNotifiers'], {
            answerConfirmedNotifiers: answerConfirmedNotifiersSpy,
        });
    });

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [
                { provide: TimeService, useValue: timeServiceSpy },
                { provide: PlayerHandlerService, useValue: playerHandlerServiceSpy },
            ],
        });
        service = TestBed.inject(GameHandlerService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should set gameState to the correct value when gameStateSubject is updated', () => {
        service['gameStateSubject'].next(GameState.ShowQuestion);
        expect(service['gameState']).toEqual(GameState.ShowQuestion);

        service['gameStateSubject'].next(GameState.ShowAnswer);
        expect(service['gameState']).toEqual(GameState.ShowAnswer);

        service['gameStateSubject'].next(GameState.GameEnded);
        expect(service['gameState']).toEqual(GameState.GameEnded);
    });

    it('data should return the correct value', () => {
        service['gameData'] = TEST_GAME;

        expect(service.data).toEqual(TEST_GAME);
    });

    it('time should call timeService.getTime with the correct timerId if gameState is ShowQuestion and show the correct time', () => {
        service['timerIds'] = TIMER_IDS;
        service['gameState'] = GameState.ShowQuestion;
        timeServiceSpy.getTime.and.returnValue(TIME_OUT);

        expect(service.time).toEqual(TIME_OUT);
        expect(timeServiceSpy.getTime).toHaveBeenCalledWith(service['timerIds'][QUESTION_TIMER_INDEX]);
    });

    it('time should call timeService.getTime with the correct timerId if gameState is ShowAnswer and show the correct time', () => {
        service['timerIds'] = TIMER_IDS;
        service['gameState'] = GameState.ShowAnswer;
        timeServiceSpy.getTime.and.returnValue(TIME_OUT);

        expect(service.time).toEqual(TIME_OUT);
        expect(timeServiceSpy.getTime).toHaveBeenCalledWith(ANSWER_TIMER_INDEX);
    });

    it('time should return 0 if gameState is GameEnded', () => {
        service['gameState'] = GameState.GameEnded;

        expect(service.time).toEqual(0);
        expect(timeServiceSpy.getTime).not.toHaveBeenCalled();
    });

    it('time should return 0 if gameState is not recognized', () => {
        service['gameState'] = 3;

        expect(service.time).toEqual(0);
        expect(timeServiceSpy.getTime).not.toHaveBeenCalled();
    });

    it('currentQuestion should return the correct value', () => {
        const questionIndex = 1;
        service['gameData'] = TEST_GAME;
        service['currentQuestionIndex'] = questionIndex;

        expect(service.currentQuestion).toEqual(TEST_GAME.questions[questionIndex]);
    });

    it('stateSubject should return the correct value', () => {
        expect(service.stateSubject).toEqual(service['gameStateSubject']);
    });

    it('startGame should call subscribeToPlayerAnswers', () => {
        spyOn(service, 'subscribeToPlayerAnswers');
        service.startGame();
        expect(service.subscribeToPlayerAnswers).toHaveBeenCalled();
    });

    it('startGame should create two timers and assign the correct timerIds', () => {
        service.startGame();
        expect(timeServiceSpy.createTimer).toHaveBeenCalledTimes(2);
        expect(service['timerIds']).toEqual([0, 1]);
    });

    it('should call showAnswer when the first timer is triggered', () => {
        spyOn(service, 'showAnswer');
        service['timerIds'][QUESTION_TIMER_INDEX] = service['timeService'].createTimer(service.showAnswer.bind(service));

        timerCallback();
        expect(service.showAnswer).toHaveBeenCalled();
    });

    it('subscription to answerNotifier should increase player score when an answer is confirmed', () => {
        const mockPlayers = [
            { score: 0, answerConfirmedNotifiers: new Subject<void>() },
            { score: 0, answerConfirmedNotifiers: new Subject<void>() },
        ];
    });

    it('subscription to answerNotifier should increment nAnswersConfirmed when an answer is confirmed', () => {
        const mockPlayers = [
            { score: 0, answerConfirmedNotifiers: new Subject<void>() },
            { score: 0, answerConfirmedNotifiers: new Subject<void>() },
        ];

        service.subscribeToPlayerAnswers();
        answerConfirmedNotifiersSpy[0].next();
        expect(service['nAnswersConfirmed']).toEqual(1);
    });

    it('subscription to answerNotifier should set time to 0 when all players have confirmed their answer', () => {
        const mockPlayers = [
            { score: 0, answerConfirmedNotifiers: new Subject<void>() },
            { score: 0, answerConfirmedNotifiers: new Subject<void>() },
        ];

        service.subscribeToPlayerAnswers();
        answerConfirmedNotifiersSpy.forEach((subject: Subject<void>) => {
            subject.next();
        });

        expect(timeServiceSpy.setTime).toHaveBeenCalledWith(TIMER_IDS[QUESTION_TIMER_INDEX], 0);
    });

    it('subscription to answerNotifier should not set time to 0 when not all players have confirmed their answer', () => {
        service.subscribeToPlayerAnswers();
        answerConfirmedNotifiersSpy[0].next();
        expect(timeServiceSpy.setTime).not.toHaveBeenCalled();
    });

    it('should call setUpNextQuestion when the second timer is triggered', () => {
        spyOn(service, 'setUpNextQuestion');
        service['timerIds'][ANSWER_TIMER_INDEX] = service['timeService'].createTimer(service.setUpNextQuestion.bind(service));

        timerCallback();
        expect(service.setUpNextQuestion).toHaveBeenCalled();
    });

    it('startGame should call getGameData and resetGameState', () => {
        spyOn(service, 'getGameData');
        spyOn(service, 'resetGameState');

        service.startGame();

        expect(service.getGameData).toHaveBeenCalled();
        expect(service.resetGameState).toHaveBeenCalled();
    });

    it('getGameData should set gameData to the correct value', () => {
        // TODO : Use a mock server call
        service.getGameData();

        expect(service['gameData']).toEqual(TEST_GAME);
    });

    it('resetGameState should emit the correct value if currentQuestionIndex is greater than or equal to gameData.questions.length', () => {
        service['gameData'] = TEST_GAME;
        service['currentQuestionIndex'] = 3;
        spyOn(service['gameStateSubject'], 'next');

        service.resetGameState();

        expect(service['gameStateSubject'].next).toHaveBeenCalledWith(GameState.GameEnded);
    });

    it('resetGameState should emit the correct value', () => {
        service['gameData'] = TEST_GAME;
        service['currentQuestionIndex'] = 2;
        spyOn(service['gameStateSubject'], 'next');

        service.resetGameState();

        expect(service['gameStateSubject'].next).toHaveBeenCalledWith(GameState.ShowQuestion);
    });

    it('resetGameState should call timeService.startTimer with the correct timerId and timePerQuestion', () => {
        service['timerIds'][QUESTION_TIMER_INDEX] = TIMER_IDS[QUESTION_TIMER_INDEX];
        service['gameData'] = TEST_GAME;
        service['currentQuestionIndex'] = 2;
        service.resetGameState();

        expect(timeServiceSpy.startTimer).toHaveBeenCalledWith(TIMER_IDS[QUESTION_TIMER_INDEX], TEST_GAME.timePerQuestion);
    });

    it('showAnswer should emit the correct value', () => {
        spyOn(service['gameStateSubject'], 'next');

        service.showAnswer();

        expect(service['gameStateSubject'].next).toHaveBeenCalledWith(GameState.ShowAnswer);
    });

    it('showAnswer should call timeService.startTimer with the correct timerId and SHOW_ANSWER_DELAY', () => {
        service['timerIds'][ANSWER_TIMER_INDEX] = TIMER_IDS[ANSWER_TIMER_INDEX];
        service.showAnswer();

        expect(timeServiceSpy.startTimer).toHaveBeenCalledWith(TIMER_IDS[ANSWER_TIMER_INDEX], SHOW_ANSWER_DELAY);
    });

    it('setUpNextQuestion should increment currentQuestionIndex and call resetGameState', () => {
        service['currentQuestionIndex'] = 0;
        spyOn(service, 'resetGameState');
        service.setUpNextQuestion();

        expect(service['currentQuestionIndex']).toEqual(1);
        expect(service.resetGameState).toHaveBeenCalled();
    });

    it('cleanUp should unsubscribe from gameStateSubject', () => {
        spyOn(service['gameStateSubscription'], 'unsubscribe');

        service.cleanUp();

        expect(service['gameStateSubscription'].unsubscribe).toHaveBeenCalled();
    });

    it('cleanUp should unsubscribe from answerConfirmedSubscriptions', () => {
        service.startGame();
        service['answerConfirmedSubscriptions'].forEach((subscription: Subscription) => {
            spyOn(subscription, 'unsubscribe');
        });

        service.cleanUp();

        service['answerConfirmedSubscriptions'].forEach((subscription: Subscription) => {
            expect(subscription.unsubscribe).toHaveBeenCalled();
        });
    });
});
