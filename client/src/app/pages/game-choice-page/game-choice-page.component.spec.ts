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
            imports: [RouterTestingModule], // Importer RouterTestingModule pour simuler la navigation
            declarations: [GameChoicePageComponent],
        }).compileComponents();

        fixture = TestBed.createComponent(GameChoicePageComponent);
        component = fixture.componentInstance;
        router = TestBed.inject(Router); // Injecter le service Router pour vérifier la navigation
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should set chosenGame on choisirJeu call', () => {
        const jeu = 'Math';
        component.choisirJeu(jeu);
        expect(component.chosenGame).toEqual(jeu);
    });

    it('should navigate on createGame call', () => {
        const jeu = 'Science';
        component.choisirJeu(jeu);
        const navigateSpy = spyOn(router, 'navigate');
        component.createGame();
        expect(navigateSpy).toHaveBeenCalledWith(['/questions', jeu]);
    });

    it('should navigate on testGame call', () => {
        const jeu = 'Programmation';
        component.choisirJeu(jeu);
        const navigateSpy = spyOn(router, 'navigate');
        component.testGame();
        expect(navigateSpy).toHaveBeenCalledWith(['/test', jeu]);
    });
});
