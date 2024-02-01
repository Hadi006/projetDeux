import { TestBed } from '@angular/core/testing';

import { GameHandlerService, TEST_GAME } from '@app/services/game-handler.service';
import { QuestionData } from '@common/question-data';
import { QuestionHandlerService } from '@app/services/question-handler.service';
import { GameTimersService } from '@app/services/game-timers.service';
import { PlayerHandlerService } from './player-handler.service';
import { Subject } from 'rxjs';

describe('GameHandlerService', () => {
    let service: GameHandlerService;
    let questionHandlerServiceSpy: jasmine.SpyObj<QuestionHandlerService>;
    let questionsData: QuestionData[];
    let gameTimersServiceSpy: jasmine.SpyObj<GameTimersService>;
    let playerHandlerServiceSpy: jasmine.SpyObj<PlayerHandlerService>;
    let mockSubject: Subject<void>;

    beforeEach(() => {
        questionHandlerServiceSpy = jasmine.createSpyObj<QuestionHandlerService>('QuestionHandlerService', ['resetPlayerAnswers', 'questionsData']);
        Object.defineProperty(questionHandlerServiceSpy, 'questionsData', {
            set: (data) => {
                questionsData = data;
            },
            configurable: true,
        });

        gameTimersServiceSpy = jasmine.createSpyObj<GameTimersService>('GameTimersService', ['startQuestionTimer', 'stopQuestionTimer']);

        playerHandlerServiceSpy = jasmine.createSpyObj<PlayerHandlerService>('PlayerHandlerService', ['nPlayers', 'answerConfirmedSubject']);
        Object.defineProperty(playerHandlerServiceSpy, 'nPlayers', {
            get: () => 0,
            configurable: true,
        });
        mockSubject = new Subject();
        spyOn(mockSubject, 'next').and.callThrough();
        Object.defineProperty(playerHandlerServiceSpy, 'answerConfirmedSubject', {
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
                { provide: PlayerHandlerService, useValue: playerHandlerServiceSpy },
            ],
        });
        service = TestBed.inject(GameHandlerService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should call stop question timer when all players have answered', () => {
        const nPlayers = 2;
        spyOnProperty(playerHandlerServiceSpy, 'nPlayers', 'get').and.returnValue(nPlayers);
        for (let i = 0; i < nPlayers; i++) {
            mockSubject.next();
        }

        expect(gameTimersServiceSpy.stopQuestionTimer).toHaveBeenCalled();
    });

    it('should increment number of answered players and reset the count when all players have answered', () => {
        const nPlayers = 2;
        spyOnProperty(playerHandlerServiceSpy, 'nPlayers', 'get').and.returnValue(nPlayers);
        for (let i = 0; i < nPlayers; i++) {
            playerHandlerServiceSpy.answerConfirmedSubject.next();
        }
        expect(gameTimersServiceSpy.stopQuestionTimer).toHaveBeenCalledTimes(1);
        for (let i = 0; i < nPlayers; i++) {
            playerHandlerServiceSpy.answerConfirmedSubject.next();
        }
        expect(gameTimersServiceSpy.stopQuestionTimer).toHaveBeenCalledTimes(2);
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
        expect(questionHandlerServiceSpy.resetPlayerAnswers).toHaveBeenCalled();
        expect(gameTimersServiceSpy.startQuestionTimer).toHaveBeenCalledWith(TEST_GAME.timePerQuestion);
    });

    it('cleanup should unsubscribe from the answerConfirmedSubject', () => {
        service.cleanup();
        const nPlayers = 2;
        spyOnProperty(playerHandlerServiceSpy, 'nPlayers', 'get').and.returnValue(nPlayers);
        for (let i = 0; i < nPlayers; i++) {
            playerHandlerServiceSpy.answerConfirmedSubject.next();
        }
        expect(gameTimersServiceSpy.stopQuestionTimer).not.toHaveBeenCalled();
    });
});
