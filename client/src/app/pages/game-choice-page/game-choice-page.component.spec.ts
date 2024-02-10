import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { GameChoicePageComponent } from './game-choice-page.component';

describe('GameChoicePageComponent', () => {
    let component: GameChoicePageComponent;
    let fixture: ComponentFixture<GameChoicePageComponent>;
    let router: Router;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [RouterTestingModule],
            declarations: [GameChoicePageComponent],
        }).compileComponents();

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
        component.createGame();
        expect(navigateSpy).toHaveBeenCalledWith(['/questions', game]);
    });

    it('should navigate on testGame call', () => {
        const game = 'Programmation';
        component.chooseGame(game);
        const navigateSpy = spyOn(router, 'navigate');
        component.testGame();
        expect(navigateSpy).toHaveBeenCalledWith(['/test', game]);
    });
});
