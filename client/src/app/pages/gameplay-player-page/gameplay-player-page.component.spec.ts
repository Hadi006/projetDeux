import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { ChatboxComponent } from '@app/components/chatbox/chatbox.component';
import { GameTimersComponent } from '@app/components/game-timers/game-timers.component';
import { QuestionComponent } from '@app/components/question/question.component';
import { GameplayPlayerPageComponent } from '@app/pages/gameplay-player-page/gameplay-player-page.component';
import { QuestionHandlerService } from '@app/services/question-handler.service';
import { Router } from '@angular/router';
import { HttpClientTestingModule } from '@angular/common/http/testing';

describe('GameplayPlayerPageComponent', () => {
    let component: GameplayPlayerPageComponent;
    let fixture: ComponentFixture<GameplayPlayerPageComponent>;
    let routerSpy: jasmine.SpyObj<Router>;
    let questionHandlerService: QuestionHandlerService;

    beforeEach(() => {
        routerSpy = jasmine.createSpyObj('Router', ['navigate']);
    });

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule({
            declarations: [GameplayPlayerPageComponent, GameTimersComponent, QuestionComponent, ChatboxComponent],
            imports: [HttpClientTestingModule],
            providers: [{ provide: Router, useValue: routerSpy }, QuestionHandlerService],
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

    it('should navigate to game page when game ends', () => {
        expect(routerSpy.navigate).toHaveBeenCalledWith(['game']);
    });

    it('ngOnInit should navigate to game page if there is no quiz', () => {
        component.ngOnInit();
        expect(routerSpy.navigate).toHaveBeenCalledWith(['game']);
    });

    it('ngOnDestroy should unsubscribe from gameEndedSubscription', () => {
        routerSpy.navigate.calls.reset();
        component.ngOnDestroy();
        expect(routerSpy.navigate).not.toHaveBeenCalled();
    });
});
