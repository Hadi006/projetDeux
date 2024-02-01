import { TestBed } from '@angular/core/testing';

import { GameHandlerService, TEST_GAME } from '@app/services/game-handler.service';
import { QuestionData } from '@common/question-data';
import { QuestionHandlerService } from './question-handler.service';

describe('GameHandlerService', () => {
    let service: GameHandlerService;
    let questionHandlerServiceSpy: jasmine.SpyObj<QuestionHandlerService>;
    let questionsData: QuestionData[];

    beforeEach(() => {
        questionHandlerServiceSpy = jasmine.createSpyObj<QuestionHandlerService>('QuestionHandlerService', ['resetPlayerAnswers', 'questionsData']);
        Object.defineProperty(questionHandlerServiceSpy, 'questionsData', {
            set: (data) => {
                questionsData = data;
            },
            configurable: true,
        });
    });

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [{ provide: QuestionHandlerService, useValue: questionHandlerServiceSpy }],
        });
        service = TestBed.inject(GameHandlerService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('loadGameData should load the correct game', () => {
        // TODO - mock the http request
        service.loadGameData();
        expect(service.gameData).toEqual(TEST_GAME);
    });

    it('startGame should set questionsData and reset player answers', () => {
        service.loadGameData();
        service.startGame();
        expect(questionsData).toEqual(TEST_GAME.questions);
        expect(questionHandlerServiceSpy.resetPlayerAnswers).toHaveBeenCalled();
    });
});
