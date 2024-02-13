import { TestBed } from '@angular/core/testing';

import { QuestionHandlerService, GOOD_ANSWER_MULTIPLIER } from '@app/services/question-handler.service';
import { PlayerHandlerService } from '@app/services/player-handler.service';
import { GameTimersService } from '@app/services/game-timers.service';
import { GameStateService, GameState } from '@app/services/game-state.service';
import { of, Subject } from 'rxjs';
import { Answer, Question } from '@common/quiz';

describe('QuestionHandlerService', () => {
    let service: QuestionHandlerService;
    let playerHandlerServiceSpy: jasmine.SpyObj<PlayerHandlerService>;
    let gameTimersServiceSpy: jasmine.SpyObj<GameTimersService>;
    let gameStateService: GameStateService;
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
                type: 'multiple-choices',
            },
            {
                id: '1',
                points: 10,
                text: 'What is the capital of France?',
                choices: [],
                type: 'text',
            },
        ];

        playerHandlerServiceSpy = jasmine.createSpyObj<PlayerHandlerService>('PlayerHandlerService', [
            'players',
            'resetPlayerAnswers',
            'validatePlayerAnswers',
            'updateScores',
        ]);
        Object.defineProperty(playerHandlerServiceSpy, 'players', {
            get: () => {
                return [];
            },
            configurable: true,
        });

        gameTimersServiceSpy = jasmine.createSpyObj<GameTimersService>('GameTimersService', ['timerEndedSubject']);
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
                { provide: PlayerHandlerService, useValue: playerHandlerServiceSpy },
                {
                    provide: GameTimersService,
                    useValue: gameTimersServiceSpy,
                },
                GameStateService,
            ],
        });
        service = TestBed.inject(QuestionHandlerService);
        service.questionsData = [...QUESTIONS_DATA];
        gameStateService = TestBed.inject(GameStateService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should update scores when timer ends', () => {
        spyOn(service, 'updateScores');
        gameStateService.gameState = GameState.ShowQuestion;
        playerHandlerServiceSpy.validatePlayerAnswers.and.returnValue(of(null));
        gameTimersServiceSpy.timerEndedSubject.next();
        expect(service.updateScores).toHaveBeenCalled();
    });

    it('should update scores when timer ends and there is no current question', () => {
        spyOnProperty(service, 'currentQuestion', 'get').and.returnValue(undefined);
        spyOn(service, 'updateScores');
        gameStateService.gameState = GameState.ShowQuestion;
        playerHandlerServiceSpy.validatePlayerAnswers.and.returnValue(of(null));
        gameTimersServiceSpy.timerEndedSubject.next();
        expect(service.updateScores).toHaveBeenCalled();
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
        expect(playerHandlerServiceSpy.resetPlayerAnswers).toHaveBeenCalledWith(3);
    });

    it('resetAnswers should call resetPlayerAnswers with 0 if there is no current question', () => {
        spyOnProperty(service, 'currentQuestion', 'get').and.returnValue(undefined);
        service.resetAnswers();
        expect(playerHandlerServiceSpy.resetPlayerAnswers).toHaveBeenCalledWith(0);
    });

    it('updateScores should update the scores of the players', () => {
        service.updateScores();
        expect(playerHandlerServiceSpy.updateScores).toHaveBeenCalledWith(QUESTIONS_DATA[0].points * GOOD_ANSWER_MULTIPLIER);
    });

    it('updateScores should not update the scores if there is no current question', () => {
        spyOnProperty(service, 'currentQuestion', 'get').and.returnValue(undefined);
        service.updateScores();
        expect(playerHandlerServiceSpy.updateScores).toHaveBeenCalledWith(0);
    });

    it('nextQuestion should load the next question', () => {
        service.nextQuestion();
        expect(service.currentQuestion).toEqual(QUESTIONS_DATA[1]);
    });

    it('ngOnDestroy should unsubscribe from the timerEndedSubject', () => {
        spyOn(service, 'updateScores');
        service.ngOnDestroy();
        gameTimersServiceSpy.timerEndedSubject.next();
        expect(service.updateScores).not.toHaveBeenCalled();
    });
});
