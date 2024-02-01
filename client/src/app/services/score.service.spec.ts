import { TestBed } from '@angular/core/testing';

import { ScoreService, GOOD_ANSWER_MULTIPLIER } from '@app/services/score.service';
import { QuestionHandlerService } from '@app/services/question-handler.service';
import { PlayerHandlerService } from '@app/services/player-handler.service';
import { GameTimersService } from '@app/services/game-timers.service';
import { Player } from '@app/interfaces/player';
import { QUESTIONS_DATA } from '@app/services/game-handler.service';
import { Subject } from 'rxjs';

describe('ScoreService', () => {
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

    let service: ScoreService;
    let questionHandlerServiceSpy: jasmine.SpyObj<QuestionHandlerService>;
    let playerHandlerServiceSpy: jasmine.SpyObj<PlayerHandlerService>;
    let gameTimersServiceSpy: jasmine.SpyObj<GameTimersService>;
    let mockSubject: Subject<void>;
    let mockPlayers: Map<number, Player>;

    beforeEach(() => {
        questionHandlerServiceSpy = jasmine.createSpyObj<QuestionHandlerService>('QuestionHandlerService', ['currentQuestion', 'isAnswerCorrect']);
        Object.defineProperty(questionHandlerServiceSpy, 'currentQuestion', {
            get: () => {
                return undefined;
            },
            configurable: true,
        });

        playerHandlerServiceSpy = jasmine.createSpyObj<PlayerHandlerService>('PlayerHandlerService', ['players']);
        mockPlayers = PLAYERS;
        Object.defineProperty(playerHandlerServiceSpy, 'players', {
            get: () => {
                return mockPlayers;
            },
            configurable: true,
        });
        spyOnProperty(playerHandlerServiceSpy, 'players', 'get').and.returnValue(PLAYERS);

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
                { provide: QuestionHandlerService, useValue: questionHandlerServiceSpy },
                { provide: PlayerHandlerService, useValue: playerHandlerServiceSpy },
                { provide: GameTimersService, useValue: gameTimersServiceSpy },
            ],
        });
        service = TestBed.inject(ScoreService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should update scores when timer ends', () => {
        spyOn(service, 'updateScores');
        gameTimersServiceSpy.timerEndedSubject.next();
        expect(service.updateScores).toHaveBeenCalled();
    });

    it('updateScores should update the scores of the players', () => {
        const score = 10;
        spyOn(service, 'calculateScore').and.returnValue(score);
        service.updateScores();
        PLAYERS.forEach((player) => {
            expect(player.score).toBe(score);
        });
    });

    it('calculateScore should return 0 if there is no current question', () => {
        spyOnProperty(questionHandlerServiceSpy, 'currentQuestion', 'get').and.returnValue(undefined);
        expect(service.calculateScore([])).toEqual(0);
    });

    it('calculateScore should return the correct value for a correct answer', () => {
        spyOnProperty(questionHandlerServiceSpy, 'currentQuestion', 'get').and.returnValue(QUESTIONS_DATA[0]);
        questionHandlerServiceSpy.isAnswerCorrect.and.returnValue(true);
        expect(service.calculateScore([])).toEqual(QUESTIONS_DATA[0].points * GOOD_ANSWER_MULTIPLIER);
    });

    it('calculateScore should return 0 for an incorrect answer', () => {
        spyOnProperty(questionHandlerServiceSpy, 'currentQuestion', 'get').and.returnValue(QUESTIONS_DATA[0]);
        questionHandlerServiceSpy.isAnswerCorrect.and.returnValue(false);
        expect(service.calculateScore([])).toEqual(0);
    });

    it('cleanUp should unsubscribe from the timerEndedSubject', () => {
        spyOn(service, 'updateScores');
        service.cleanUp();
        gameTimersServiceSpy.timerEndedSubject.next();
        expect(service.updateScores).not.toHaveBeenCalled();
    });
});
