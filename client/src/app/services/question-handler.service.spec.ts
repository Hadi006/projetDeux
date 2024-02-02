import { TestBed } from '@angular/core/testing';

import { QuestionHandlerService, GOOD_ANSWER_MULTIPLIER } from '@app/services/question-handler.service';
import { PlayerHandlerService } from '@app/services/player-handler.service';
import { GameTimersService } from '@app/services/game-timers.service';
import { QUESTIONS_DATA } from '@app/services/game-handler.service';
import { Player } from '@app/interfaces/player';
import { Subject } from 'rxjs';

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

    let service: QuestionHandlerService;
    let playerHandlerServiceSpy: jasmine.SpyObj<PlayerHandlerService>;
    let gameTimersServiceSpy: jasmine.SpyObj<GameTimersService>;
    let mockSubject: Subject<void>;

    beforeEach(() => {
        playerHandlerServiceSpy = jasmine.createSpyObj<PlayerHandlerService>('PlayerHandlerService', ['players']);
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

    it('questionsData setter should set the questionsData and nQuestions', () => {
        service.questionsData = QUESTIONS_DATA;
        expect(service.currentQuestion).toEqual(QUESTIONS_DATA[0]);
        expect(service.nQuestions).toEqual(QUESTIONS_DATA.length);
    });

    it('resetAnswers should reset the player answers', () => {
        spyOnProperty(playerHandlerServiceSpy, 'players', 'get').and.returnValue(PLAYERS);
        service.questionsData = QUESTIONS_DATA;
        service.resetAnswers();
        PLAYERS.forEach((player) => {
            expect(player.answer).toEqual([false, false, false, false]);
            expect(player.answerConfirmed).toEqual(false);
        });
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

    it('calculateScore should return 0 if there is no current question', () => {
        spyOnProperty(service, 'currentQuestion', 'get').and.returnValue(undefined);
        expect(service.calculateScore([])).toEqual(0);
    });

    it('calculateScore should return the correct value for a correct answer', () => {
        spyOnProperty(service, 'currentQuestion', 'get').and.returnValue(QUESTIONS_DATA[0]);
        spyOn(service, 'isAnswerCorrect').and.returnValue(true);
        expect(service.calculateScore([])).toEqual(QUESTIONS_DATA[0].points * GOOD_ANSWER_MULTIPLIER);
    });

    it('calculateScore should return 0 for an incorrect answer', () => {
        spyOnProperty(service, 'currentQuestion', 'get').and.returnValue(QUESTIONS_DATA[0]);
        spyOn(service, 'isAnswerCorrect').and.returnValue(false);
        expect(service.calculateScore([])).toEqual(0);
    });

    it('isAnswerCorrect should return true if the question is not MCQ', () => {
        spyOnProperty(service, 'currentQuestion', 'get').and.returnValue(QUESTIONS_DATA[1]);
        expect(service.isAnswerCorrect([false, false, false, false])).toEqual(true);
    });

    it('isAnswerCorrect should return true if the answer is correct', () => {
        const answers = [false, true, false, false];
        spyOnProperty(service, 'currentQuestion', 'get').and.returnValue(QUESTIONS_DATA[0]);
        expect(service.isAnswerCorrect(answers)).toEqual(true);
    });

    it('isAnswerCorrect should return false if the answer is incorrect', () => {
        const answers = [true, false, false, false];
        spyOnProperty(service, 'currentQuestion', 'get').and.returnValue(QUESTIONS_DATA[0]);
        expect(service.isAnswerCorrect(answers)).toEqual(false);
    });

    it('cleanUp should unsubscribe from the timerEndedSubject', () => {
        spyOn(service, 'updateScores');
        service.cleanUp();
        gameTimersServiceSpy.timerEndedSubject.next();
        expect(service.updateScores).not.toHaveBeenCalled();
    });
});
