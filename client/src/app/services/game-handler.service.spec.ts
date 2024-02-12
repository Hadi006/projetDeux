import { TestBed } from '@angular/core/testing';
import { GameHandlerService } from '@app/services/game-handler.service';
import { GameStateService } from '@app/services/game-state.service';
import { GameTimersService } from '@app/services/game-timers.service';
import { QuestionHandlerService } from '@app/services/question-handler.service';
import { GameState, SHOW_ANSWER_DELAY, TEST_GAME } from '@common/constant';
import { QuestionData } from '@common/question-data';
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
            'resetAnswers',
            'questionsData',
            'currentQuestion',
        ]);
        Object.defineProperty(questionHandlerServiceSpy, 'questionsData', {
            set: (data) => {
                questionsData = data;
            },
            configurable: true,
        });
        Object.defineProperty(questionHandlerServiceSpy, 'currentQuestion', {
            get: () => {
                return questionsData[0];
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
        const subjectSpy = jasmine.createSpyObj('Subject', ['next']);
        service['internalGameEnded$'] = subjectSpy;
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
        expect(questionHandlerServiceSpy.resetAnswers).toHaveBeenCalled();
        expect(gameTimersServiceSpy.startQuestionTimer).toHaveBeenCalledWith(TEST_GAME.timePerQuestion);
    });

    it('setUpNextState should set the game correctly if state is show question', () => {
        gameStateService.gameState = GameState.ShowQuestion;
        expect(gameStateService.gameState).toBe(GameState.ShowQuestion);
        service.setUpNextState();
        expect(gameTimersServiceSpy.startAnswerTimer).toHaveBeenCalledWith(SHOW_ANSWER_DELAY);
        expect(gameStateService.gameState.valueOf()).toBe(GameState.ShowAnswer.valueOf());
    });

    it('setUpNextState should set the game correctly if state is show answer and the next question exists', () => {
        gameStateService.gameState = GameState.ShowAnswer;
        spyOnProperty(questionHandlerServiceSpy, 'currentQuestion', 'get').and.returnValue(TEST_GAME.questions[0]);
        service.loadGameData();
        service.setUpNextState();
        expect(gameTimersServiceSpy.startQuestionTimer).toHaveBeenCalledWith(TEST_GAME.timePerQuestion);
        expect(gameStateService.gameState.valueOf()).toBe(GameState.ShowQuestion.valueOf());
    });

    it('setUpNextState should set the game correctly if state is show answer and the next question does not exist', () => {
        gameStateService.gameState = GameState.ShowAnswer;
        spyOnProperty(service, 'gameEnded$', 'get').and.callThrough();
        spyOnProperty(questionHandlerServiceSpy, 'currentQuestion', 'get').and.returnValue(undefined);
        service.setUpNextState();
        expect(service.gameEnded$.next).toHaveBeenCalled();
        expect(gameStateService.gameState.valueOf()).toBe(GameState.GameEnded.valueOf());
    });

    it('setUpNextState should set the game correctly if the state is not show answer or show question', () => {
        gameStateService.gameState = GameState.GameEnded;
        spyOnProperty(service, 'gameEnded$', 'get').and.callThrough();
        service.setUpNextState();
        expect(service.gameEnded$.next).toHaveBeenCalled();
        expect(gameStateService.gameState).toBe(GameState.GameEnded);
        const unrecognizedState = 100;
        gameStateService.gameState = unrecognizedState;
        service.setUpNextState();
        expect(service.gameEnded$.next).toHaveBeenCalledTimes(2);
        expect(gameStateService.gameState.valueOf()).toBe(GameState.GameEnded.valueOf());
    });

    it('ngOnDestroy should unsubscribe from timer ended', () => {
        spyOn(service, 'setUpNextState');
        service.ngOnDestroy();
        gameTimersServiceSpy.timerEndedSubject.next();
        expect(service.setUpNextState).not.toHaveBeenCalled();
    });
});
