import { TestBed } from '@angular/core/testing';
import { GameHandlerService } from '@app/services/game-handler.service';
import { QuestionHandlerService } from '@app/services/question-handler.service';
import { GameState, SHOW_ANSWER_DELAY } from '@common/constant';
import { Question, Quiz } from '@common/quiz';
import { Subject } from 'rxjs';
import { GameManagementService } from './game-management.service';

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
                type: 'QCM',
            },
            {
                id: '1',
                points: 1,
                text: 'What is the capital of France?',
                choices: [],
                type: 'QRL',
            },
        ],
    };

    let service: GameHandlerService;
    let questionHandlerServiceSpy: jasmine.SpyObj<QuestionHandlerService>;
    let questionsData: Question[];
    let gameManagementServiceSpy: jasmine.SpyObj<GameManagementService>;
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

        gameManagementServiceSpy = jasmine.createSpyObj<GameManagementService>('GameTimersService', [
            'startQuestionTimer',
            'startAnswerTimer',
            'stopQuestionTimer',
            'timerEndedSubject',
        ]);
        mockSubject = new Subject<void>();
        Object.defineProperty(gameManagementServiceSpy, 'timerEndedSubject', {
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
                { provide: GameManagementService, useValue: gameManagementServiceSpy },
            ],
        });
        service = TestBed.inject(GameHandlerService);
        const subjectSpy = jasmine.createSpyObj('Subject', ['next']);
        service['internalGameEnded$'] = subjectSpy;
        service.loadQuizData(TEST_QUIZ);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should call setUpNextState when time has ended', () => {
        spyOn(service, 'setUpNextState');
        gameManagementServiceSpy.timerEndedSubject.next();
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
        expect(gameManagementServiceSpy.startQuestionTimer).toHaveBeenCalledWith(TEST_QUIZ.duration);
        expect(gameManagementServiceSpy.gameState).toBe(GameState.ShowQuestion);
    });

    it('startGame should do nothing if quizData is not set', () => {
        service.loadQuizData(undefined);
        service.startGame();
        expect(questionHandlerServiceSpy.resetAnswers).not.toHaveBeenCalled();
        expect(gameManagementServiceSpy.startQuestionTimer).not.toHaveBeenCalled();
        expect(gameManagementServiceSpy.gameState).toBe(GameState.ShowQuestion);
    });

    it('setUpNextState should set the game correctly if state is show question', () => {
        gameManagementServiceSpy.gameState = GameState.ShowQuestion;
        expect(gameManagementServiceSpy.gameState).toBe(GameState.ShowQuestion);
        service.setUpNextState();
        expect(gameManagementServiceSpy.startAnswerTimer).toHaveBeenCalledWith(SHOW_ANSWER_DELAY);
        expect(gameManagementServiceSpy.gameState.valueOf()).toBe(GameState.ShowAnswer.valueOf());
    });

    it('setUpNextState should set the game correctly if state is show answer and the next question exists', () => {
        gameManagementServiceSpy.gameState = GameState.ShowAnswer;
        spyOnProperty(questionHandlerServiceSpy, 'currentQuestion', 'get').and.returnValue(TEST_QUIZ.questions[0]);
        service.loadQuizData(TEST_QUIZ);
        service.setUpNextState();
        expect(gameManagementServiceSpy.startQuestionTimer).toHaveBeenCalledWith(TEST_QUIZ.duration);
        expect(gameManagementServiceSpy.gameState.valueOf()).toBe(GameState.ShowQuestion.valueOf());
    });

    it('setUpNextState should set the game correctly if state is show answer and the next question does not exist', () => {
        gameManagementServiceSpy.gameState = GameState.ShowAnswer;
        spyOnProperty(service, 'gameEnded$', 'get').and.callThrough();
        spyOnProperty(questionHandlerServiceSpy, 'currentQuestion', 'get').and.returnValue(undefined);
        service.setUpNextState();
        expect(service.gameEnded$.next).toHaveBeenCalled();
        expect(gameManagementServiceSpy.gameState.valueOf()).toBe(GameState.GameEnded.valueOf());
    });

    it('setUpNextState should set the game correctly if the state is not show answer or show question', () => {
        gameManagementServiceSpy.gameState = GameState.GameEnded;
        spyOnProperty(service, 'gameEnded$', 'get').and.callThrough();
        service.setUpNextState();
        expect(service.gameEnded$.next).toHaveBeenCalled();
        expect(gameManagementServiceSpy.gameState).toBe(GameState.GameEnded);
        const unrecognizedState = 100;
        gameManagementServiceSpy.gameState = unrecognizedState;
        service.setUpNextState();
        expect(service.gameEnded$.next).toHaveBeenCalledTimes(2);
        expect(gameManagementServiceSpy.gameState.valueOf()).toBe(GameState.GameEnded.valueOf());
    });

    it('setUpNextState should do nothing if quizData is not set', () => {
        service.loadQuizData(undefined);
        service.setUpNextState();
        expect(gameManagementServiceSpy.startAnswerTimer).not.toHaveBeenCalled();
        expect(gameManagementServiceSpy.startQuestionTimer).not.toHaveBeenCalled();
        expect(service.gameEnded$.next).not.toHaveBeenCalled();
    });

    it('ngOnDestroy should unsubscribe from timer ended', () => {
        spyOn(service, 'setUpNextState');
        service.ngOnDestroy();
        gameManagementServiceSpy.timerEndedSubject.next();
        expect(service.setUpNextState).not.toHaveBeenCalled();
    });
});
