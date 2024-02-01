import { TestBed } from '@angular/core/testing';

import { GameHandlerService, TEST_GAME } from '@app/services/game-handler.service';
import { QuestionData } from '@common/question-data';
import { QuestionHandlerService } from '@app/services/question-handler.service';
import { GameTimersService } from '@app/services/game-timers.service';

describe('GameHandlerService', () => {
    let service: GameHandlerService;
    let questionHandlerServiceSpy: jasmine.SpyObj<QuestionHandlerService>;
    let questionsData: QuestionData[];
    let gameTimersServiceSpy: jasmine.SpyObj<GameTimersService>;

    beforeEach(() => {
        questionHandlerServiceSpy = jasmine.createSpyObj<QuestionHandlerService>('QuestionHandlerService', ['resetPlayerAnswers', 'questionsData']);
        Object.defineProperty(questionHandlerServiceSpy, 'questionsData', {
            set: (data) => {
                questionsData = data;
            },
            configurable: true,
        });

        gameTimersServiceSpy = jasmine.createSpyObj<GameTimersService>('GameTimersService', ['startQuestionTimer']);
    });

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [
                { provide: QuestionHandlerService, useValue: questionHandlerServiceSpy },
                { provide: GameTimersService, useValue: gameTimersServiceSpy },
            ],
        });
        service = TestBed.inject(GameHandlerService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
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
});
