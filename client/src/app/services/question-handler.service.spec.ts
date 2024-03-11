import { TestBed } from '@angular/core/testing';
import { PlayerHandlerService } from '@app/services/player-handler.service';
import { QuestionHandlerService } from '@app/services/question-handler.service';
import { GOOD_ANSWER_MULTIPLIER, GameState } from '@common/constant';
import { Answer, Question } from '@common/quiz';
import { Subject } from 'rxjs';
import { GameManagementService } from './game-management.service';

describe('QuestionHandlerService', () => {
    let service: QuestionHandlerService;
    let playerHandlerServiceSpy: jasmine.SpyObj<PlayerHandlerService>;
    let gameManagementServiceSpy: jasmine.SpyObj<GameManagementService>;
    let mockSubject: Subject<void>;
    let answers: Answer[];
    let QUESTIONS_DATA: Question[];

    beforeEach(() => {
        answers = [
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
        ];

        QUESTIONS_DATA = [
            {
                id: '0',
                points: 10,
                text: '1+1?',
                choices: answers,
                type: 'QCM',
            },
            {
                id: '1',
                points: 10,
                text: 'What is the capital of France?',
                choices: [],
                type: 'QRL',
            },
        ];

        playerHandlerServiceSpy = jasmine.createSpyObj<PlayerHandlerService>('PlayerHandlerService', [
            'player',
            'resetPlayerAnswers',
            'validatePlayerAnswers',
        ]);
        Object.defineProperty(playerHandlerServiceSpy, 'players', {
            get: () => {
                return [];
            },
            configurable: true,
        });

        gameManagementServiceSpy = jasmine.createSpyObj<GameManagementService>('GameManagementService', ['timerEndedSubject'], {
            gameState: GameState.ShowQuestion,
        });
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
                { provide: PlayerHandlerService, useValue: playerHandlerServiceSpy },
                {
                    provide: GameManagementService,
                    useValue: gameManagementServiceSpy,
                },
            ],
        });
        service = TestBed.inject(QuestionHandlerService);
        service.questionsData = [...QUESTIONS_DATA];
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should validate answers when timer ends', () => {
        gameManagementServiceSpy.gameState = GameState.ShowQuestion;
        gameManagementServiceSpy.timerEndedSubject.next();
        expect(playerHandlerServiceSpy.validatePlayerAnswers).toHaveBeenCalledWith(
            QUESTIONS_DATA[0].text,
            QUESTIONS_DATA[0].points * GOOD_ANSWER_MULTIPLIER,
        );
    });

    it('should validate answers when timer ends and there is no current question', () => {
        spyOnProperty(service, 'currentQuestion', 'get').and.returnValue(undefined);
        gameManagementServiceSpy.gameState = GameState.ShowQuestion;
        gameManagementServiceSpy.timerEndedSubject.next();
        expect(playerHandlerServiceSpy.validatePlayerAnswers).toHaveBeenCalledWith('', 0);
    });

    it('currentQuestion getter should return the current question', () => {
        expect(service.currentQuestion).toEqual(QUESTIONS_DATA[0]);
    });

    it('currentAnswers getter should return the correct answers', () => {
        spyOnProperty(service, 'currentQuestion', 'get').and.returnValue(QUESTIONS_DATA[0]);
        expect(service.currentAnswers).toEqual(answers.filter((answer) => answer.isCorrect));
    });

    it('currentAnswers getter should return an empty array if there is no current question', () => {
        spyOnProperty(service, 'currentQuestion', 'get').and.returnValue(undefined);
        expect(service.currentAnswers).toEqual([]);
    });

    it('questionsData setter should set the questionsData', () => {
        expect(service.currentQuestion).toEqual(QUESTIONS_DATA[0]);
    });

    it('questionsData setter should reset the currentQuestionIndex', () => {
        service.nextQuestion();
        service.questionsData = [...QUESTIONS_DATA];
        expect(service.currentQuestion).toEqual(QUESTIONS_DATA[0]);
    });

    it('resetAnswers should reset the answers of the players', () => {
        spyOnProperty(service, 'currentQuestion', 'get').and.returnValue({ ...QUESTIONS_DATA[0] });
        service.resetAnswers();
        expect(playerHandlerServiceSpy.resetPlayerAnswers).toHaveBeenCalledWith(QUESTIONS_DATA[0]);
    });

    it('nextQuestion should load the next question', () => {
        service.nextQuestion();
        expect(service.currentQuestion).toEqual(QUESTIONS_DATA[1]);
    });
});
