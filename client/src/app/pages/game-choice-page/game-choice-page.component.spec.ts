import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { GameChoicePageComponent } from './game-choice-page.component';
import { GameHandlerService } from '@app/services/game-handler.service';
import { Quiz } from '@common/quiz';

describe('GameChoicePageComponent', () => {
    let component: GameChoicePageComponent;
    let fixture: ComponentFixture<GameChoicePageComponent>;
    let router: Router;
    let gameHandlerServiceSpy: jasmine.SpyObj<GameHandlerService>;
    let mockQuiz: Quiz;

    beforeEach(async () => {
        mockQuiz = {
            id: '1',
            title: 'Math',
            visible: true,
            description: 'Math quiz',
            duration: 10,
            lastModification: new Date(),
            questions: [],
        };
        gameHandlerServiceSpy = jasmine.createSpyObj('GameHandlerService', ['loadGameData']);
    });

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule({
            imports: [RouterTestingModule],
            declarations: [GameChoicePageComponent],
            providers: [{ provide: GameHandlerService, useValue: gameHandlerServiceSpy }],
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(GameChoicePageComponent);
        component = fixture.componentInstance;
        router = TestBed.inject(Router);
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should set chosenGame on choisirJeu call', () => {
        component.chooseQuiz(mockQuiz);
        expect(component.chosenQuiz).toEqual(mockQuiz);
    });

    it('should navigate on startGame call', () => {
        const navigateSpy = spyOn(router, 'navigate');
        component.chooseQuiz(mockQuiz);
        component.startGame();
        expect(gameHandlerServiceSpy.loadGameData).toHaveBeenCalled();
        expect(navigateSpy).toHaveBeenCalledWith(['lobby']);
    });

    it('should do nothing on startGame call if chosenGame is null', () => {
        const navigateSpy = spyOn(router, 'navigate');
        component.startGame();
        expect(gameHandlerServiceSpy.loadGameData).not.toHaveBeenCalled();
        expect(navigateSpy).not.toHaveBeenCalled();
    });

    it('should navigate on testGame call', () => {
        component.chooseQuiz(mockQuiz);
        const navigateSpy = spyOn(router, 'navigate');
        component.testGame();
        expect(gameHandlerServiceSpy.loadGameData).toHaveBeenCalled();
        expect(navigateSpy).toHaveBeenCalledWith(['/play']);
    });

    it('should do nothing on testGame call if chosenGame is null', () => {
        const navigateSpy = spyOn(router, 'navigate');
        component.testGame();
        expect(gameHandlerServiceSpy.loadGameData).not.toHaveBeenCalled();
        expect(navigateSpy).not.toHaveBeenCalled();
    });
});
