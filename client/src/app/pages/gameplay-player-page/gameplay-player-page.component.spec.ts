import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { ChatboxComponent } from '@app/components/chatbox/chatbox.component';
import { GameTimersComponent } from '@app/components/game-timers/game-timers.component';
import { QuestionComponent } from '@app/components/question/question.component';
import { GameplayPlayerPageComponent } from '@app/pages/gameplay-player-page/gameplay-player-page.component';
import { GameHandlerService } from '@app/services/game-handler.service';
import { QuestionHandlerService } from '@app/services/question-handler.service';

describe('GameplayPlayerPageComponent', () => {
    let component: GameplayPlayerPageComponent;
    let fixture: ComponentFixture<GameplayPlayerPageComponent>;
    let gameHandlerServiceSpy: jasmine.SpyObj<GameHandlerService>;
    let questionHandlerService: QuestionHandlerService;

    beforeEach(() => {
        gameHandlerServiceSpy = jasmine.createSpyObj('GameHandlerService', ['startGame']);
    });

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule({
            declarations: [GameplayPlayerPageComponent, GameTimersComponent, QuestionComponent, ChatboxComponent],
            providers: [{ provide: GameHandlerService, useValue: gameHandlerServiceSpy }, QuestionHandlerService],
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(GameplayPlayerPageComponent);
        component = fixture.componentInstance;
        questionHandlerService = TestBed.inject(QuestionHandlerService);
        spyOnProperty(questionHandlerService, 'currentQuestion', 'get').and.returnValue(undefined);
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('ngOnInit should call loadGameData and startGame', () => {
        expect(gameHandlerServiceSpy.startGame).toHaveBeenCalled();
    });
});
