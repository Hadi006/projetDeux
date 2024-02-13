import { TestBed } from '@angular/core/testing';
import { GameHandlerService } from '@app/services/game-handler.service';
import { GameStateService } from '@app/services/game-state.service';
import { GameTimersService } from '@app/services/game-timers.service';
import { QuestionHandlerService } from '@app/services/question-handler.service';
import { GameState, SHOW_ANSWER_DELAY } from '@common/constant';
import { Question, Quiz } from '@common/quiz';
import { Subject } from 'rxjs';

describe('GameHandlerService', () => {
    const TEST_QUIZ: Quiz = {
        id: '0',
        title: 'Math',
        visible: true,
        description: 'Math quiz',
        duration: 10,
        lastModification: new Date(),
        questions: [
            {
                id: '0',
                points: 1,
                text: '1+1?',
                choices: [
                    {
                        text: '1',
                        isCorrect: false,
                    },
                    {
                        text: '2',
                        isCorrect: true,
                    },
                    {
                        text: '3',
                        isCorrect: false,
                    },
                ],
                type: 'multiple-choices',
            },
            {
                id: '1',
                points: 1,
                text: 'What is the capital of France?',
                choices: [],
                type: 'text',
            },
        ],
    };

    let service: GameHandlerService;
    let questionHandlerServiceSpy: jasmine.SpyObj<QuestionHandlerService>;
    let questionsData: Question[];
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
        service.loadQuizData(TEST_QUIZ);
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

    it('quizData getter should return the correct quiz', () => {
        service.loadQuizData(TEST_QUIZ);
        expect(service.quizData).toEqual(TEST_QUIZ);
    });

    it('gameEnded$ getter should return the correct subject', () => {
        const subject = new Subject<void>();
        service['internalGameEnded$'] = subject;
        expect(service.gameEnded$).toEqual(subject);
    });

    it('loadQuizData should load the correct game', () => {
        service.loadQuizData(TEST_QUIZ);
        expect(service.quizData).toEqual(TEST_QUIZ);
    });

    it('startGame should set questionsData, reset player answers and start question timer with the correct value', () => {
        service.loadQuizData(TEST_QUIZ);
        service.startGame();
        expect(questionsData).toEqual(TEST_QUIZ.questions);
        expect(questionHandlerServiceSpy.resetAnswers).toHaveBeenCalled();
        expect(gameTimersServiceSpy.startQuestionTimer).toHaveBeenCalledWith(TEST_QUIZ.duration);
        expect(gameStateService.gameState).toBe(GameState.ShowQuestion);
    });

    it('startGame should do nothing if quizData is not set', () => {
        service.loadQuizData(undefined);
        service.startGame();
        expect(questionHandlerServiceSpy.resetAnswers).not.toHaveBeenCalled();
        expect(gameTimersServiceSpy.startQuestionTimer).not.toHaveBeenCalled();
        expect(gameStateService.gameState).toBe(GameState.ShowQuestion);
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
        spyOnProperty(questionHandlerServiceSpy, 'currentQuestion', 'get').and.returnValue(TEST_QUIZ.questions[0]);
        service.loadQuizData(TEST_QUIZ);
        service.setUpNextState();
        expect(gameTimersServiceSpy.startQuestionTimer).toHaveBeenCalledWith(TEST_QUIZ.duration);
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

    it('setUpNextState should do nothing if quizData is not set', () => {
        service.loadQuizData(undefined);
        service.setUpNextState();
        expect(gameTimersServiceSpy.startAnswerTimer).not.toHaveBeenCalled();
        expect(gameTimersServiceSpy.startQuestionTimer).not.toHaveBeenCalled();
        expect(service.gameEnded$.next).not.toHaveBeenCalled();
    });

    it('ngOnDestroy should unsubscribe from timer ended', () => {
        spyOn(service, 'setUpNextState');
        service.ngOnDestroy();
        gameTimersServiceSpy.timerEndedSubject.next();
        expect(service.setUpNextState).not.toHaveBeenCalled();
    });
});
