import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { QuestionHandlerService } from '@app/services/question-handler.service';
import { GameStateService, GameState } from '@app/services/game-state.service';
import { QuestionComponent } from './question.component';
import { Player } from '@app/interfaces/player';
import { QUESTIONS_DATA } from '@app/services/game-handler.service';

const TEST_PLAYER: Player = {
    score: 0,
    answer: [false, true, false, false],
    answerConfirmed: false,
    confirmAnswer: () => {
        return;
    },
};

describe('QuestionComponent', () => {
    let component: QuestionComponent;
    let fixture: ComponentFixture<QuestionComponent>;
    let questionHandlerServiceSpy: jasmine.SpyObj<QuestionHandlerService>;
    let gameStateServiceSpy: jasmine.SpyObj<GameStateService>;

    beforeEach(() => {
        questionHandlerServiceSpy = jasmine.createSpyObj<QuestionHandlerService>('QuestionHandlerService', ['currentQuestion']);
        Object.defineProperty(questionHandlerServiceSpy, 'currentQuestion', {
            get: () => {
                return undefined;
            },
            configurable: true,
        });

        gameStateServiceSpy = jasmine.createSpyObj<GameStateService>('GameStateService', ['gameState']);
        Object.defineProperty(gameStateServiceSpy, 'gameState', {
            get: () => {
                return GameState.ShowQuestion;
            },
            configurable: true,
        });
    });

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule({
            declarations: [QuestionComponent],
            providers: [
                { provide: QuestionHandlerService, useValue: questionHandlerServiceSpy },
                { provide: GameStateService, useValue: gameStateServiceSpy },
            ],
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(QuestionComponent);
        component = fixture.componentInstance;
        component.player = TEST_PLAYER;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('questionData getter should return currentQuestion', () => {
        spyOnProperty(questionHandlerServiceSpy, 'currentQuestion', 'get').and.returnValue(QUESTIONS_DATA[0]);
        expect(component.questionData).toBe(QUESTIONS_DATA[0]);
    });

    it('isChecked getter should return the players answer', () => {
        expect(component.isChecked).toBe(TEST_PLAYER.answer);
    });

    it('showingAnswer getter should return true when game state is ShowAnswer', () => {
        spyOnProperty(gameStateServiceSpy, 'gameState', 'get').and.returnValue(GameState.ShowAnswer);
        expect(component.showingAnswer).toBeTrue();
    });
});
