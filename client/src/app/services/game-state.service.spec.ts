import { TestBed } from '@angular/core/testing';

import { GameStateService, GameState } from '@app/services/game-state.service';
import { QuestionHandlerService } from '@app/services/question-handler.service';
import { QUESTIONS_DATA } from '@app/services/game-handler.service';

describe('GameStateService', () => {
    let service: GameStateService;
    let questionHandlerServiceSpy: jasmine.SpyObj<QuestionHandlerService>;

    beforeEach(() => {
        questionHandlerServiceSpy = jasmine.createSpyObj<QuestionHandlerService>('QuestionHandlerService', ['currentQuestion']);
        Object.defineProperty(questionHandlerServiceSpy, 'currentQuestion', {
            get: () => {
                return undefined;
            },
            configurable: true,
        });
    });

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [{ provide: QuestionHandlerService, useValue: questionHandlerServiceSpy }],
        });
        service = TestBed.inject(GameStateService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('nextState should set the states in the correct order if currentQuestion is defined', () => {
        spyOnProperty(questionHandlerServiceSpy, 'currentQuestion', 'get').and.returnValue(QUESTIONS_DATA[0]);
        service.nextState();
        expect(service.gameState).toBe(GameState.ShowQuestion);
        service.nextState();
        expect(service.gameState).toBe(GameState.ShowAnswer);
        service.nextState();
        expect(service.gameState).toBe(GameState.ShowQuestion);
    });
});
