import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { QuestionHandlerService } from '@app/services/question-handler.service';
import { QuestionComponent } from './question.component';
import { Player } from '@app/interfaces/player';
import { QUESTIONS_DATA } from '@app/services/game-handler.service';

const TEST_PLAYER: Player = {
    score: 0,
    answer: [],
    answerConfirmed: false,
    confirmAnswer: () => {
        return;
    },
};

describe('QuestionComponent', () => {
    let component: QuestionComponent;
    let fixture: ComponentFixture<QuestionComponent>;
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

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule({
            declarations: [QuestionComponent],
            providers: [{ provide: QuestionHandlerService, useValue: questionHandlerServiceSpy }],
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
});
