import { TestBed } from '@angular/core/testing';

import { QuestionHandlerService, GOOD_ANSWER_MULTIPLIER } from '@app/services/question-handler.service';
import { PlayerHandlerService } from '@app/services/player-handler.service';
import { GameTimersService } from '@app/services/game-timers.service';
import { Player } from '@app/interfaces/player';
import { Subject } from 'rxjs';
import { Answer, Question } from '@common/quiz';

describe('QuestionHandlerService', () => {
    const PLAYERS = new Map<number, Player>([
        [
            0,
            {
                score: 0,
                answer: [true, false],
                answerConfirmed: true,
            },
        ],
        [
            1,
            {
                score: 0,
                answer: [false, true],
                answerConfirmed: true,
            },
        ],
    ]);

    const answers: Answer[] = [
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

    const QUESTIONS_DATA: Question[] = [
        {
            id: '0',
            points: 1,
            text: '1+1?',
            choices: answers,
            type: 'multiple-choices',
        },
        {
            id: '1',
            points: 1,
            text: 'What is the capital of France?',
            choices: [],
            type: 'text',
        },
    ];

    let service: QuestionHandlerService;
    let playerHandlerServiceSpy: jasmine.SpyObj<PlayerHandlerService>;
    let gameTimersServiceSpy: jasmine.SpyObj<GameTimersService>;
    let mockSubject: Subject<void>;

    beforeEach(() => {
        playerHandlerServiceSpy = jasmine.createSpyObj<PlayerHandlerService>('PlayerHandlerService', ['players', 'resetPlayerAnswers']);
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
            ],
        });
        service = TestBed.inject(QuestionHandlerService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should update scores when timer ends', () => {
        spyOn(service, 'updateScores');
        gameTimersServiceSpy.timerEndedSubject.next();
        expect(service.updateScores).toHaveBeenCalled();
    });

    it('currentQuestion getter should return the current question', () => {
        service.questionsData = QUESTIONS_DATA;
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

    it('questionsData setter should set the questionsData and nQuestions', () => {
        service.questionsData = QUESTIONS_DATA;
        expect(service.currentQuestion).toEqual(QUESTIONS_DATA[0]);
        expect(service.nQuestions).toEqual(QUESTIONS_DATA.length);
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
        const score = 10;
        spyOnProperty(playerHandlerServiceSpy, 'players', 'get').and.returnValue(PLAYERS);
        spyOn(service, 'calculateScore').and.returnValue(score);
        service.updateScores();
        PLAYERS.forEach((player) => {
            expect(player.score).toBe(score);
        });
    });

    it('nextQuestion should load the next question', () => {
        service.questionsData = QUESTIONS_DATA;
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
