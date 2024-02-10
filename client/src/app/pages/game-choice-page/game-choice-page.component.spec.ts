import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { GameChoicePageComponent } from './game-choice-page.component';
import { GameHandlerService } from '@app/services/game-handler.service';

describe('GameChoicePageComponent', () => {
    let component: GameChoicePageComponent;
    let fixture: ComponentFixture<GameChoicePageComponent>;
    let router: Router;
    let gameHandlerServiceSpy: jasmine.SpyObj<GameHandlerService>;

    beforeEach(async () => {
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
        const game = 'Math';
        component.chooseGame(game);
        expect(component.chosenGame).toEqual(game);
    });

    it('should navigate on createGame call', () => {
        const game = 'Science';
        component.chooseGame(game);
        const navigateSpy = spyOn(router, 'navigate');
        component.previewQuestions();
        expect(navigateSpy).toHaveBeenCalledWith(['/questions', game]);
    });

    it('should navigate on startGame call', () => {
        const navigateSpy = spyOn(router, 'navigate');
        component.startGame();
        expect(gameHandlerServiceSpy.loadGameData).toHaveBeenCalled();
        expect(navigateSpy).toHaveBeenCalledWith(['lobby']);
    });

    it('should navigate on testGame call', () => {
        const game = 'Programmation';
        component.chooseGame(game);
        const navigateSpy = spyOn(router, 'navigate');
        component.testGame();
        expect(gameHandlerServiceSpy.loadGameData).toHaveBeenCalled();
        expect(navigateSpy).toHaveBeenCalledWith(['/play']);
    });
});
