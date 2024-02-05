import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { QuestionsPageComponent } from './questions-page.component';

describe('QuestionsPageComponent', () => {
    let component: QuestionsPageComponent;
    let fixture: ComponentFixture<QuestionsPageComponent>;
    let router: Router;

    // Créer un mock pour ActivatedRoute
    const activatedRouteMock = {
        snapshot: {
            paramMap: {
                get: (key: string) => {
                    if (key === 'jeu') return 'Math'; // Exemple avec le jeu 'Math'
                    return null;
                },
            },
        },
    };

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [RouterTestingModule],
            declarations: [QuestionsPageComponent],
            providers: [{ provide: ActivatedRoute, useValue: activatedRouteMock }],
        }).compileComponents();

        fixture = TestBed.createComponent(QuestionsPageComponent);
        component = fixture.componentInstance;
        router = TestBed.inject(Router);
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should initialize questions for Math game', () => {
        expect(component.jeu).toEqual('Math');
        expect(component.questions.length).toBeGreaterThan(0);
    });

    it('should set selectedQuestion on selectQuestion call', () => {
        const question = '1+1';
        component.selectQuestion(question, { currentTarget: { classList: { add: jasmine.createSpy('add') } } });
        expect(component.selectedQuestion).toEqual(question);
    });

    it('should navigate to game on goBack', () => {
        const navigateSpy = spyOn(router, 'navigate');
        component.goBack();
        expect(navigateSpy).toHaveBeenCalledWith(['game']);
    });

    // Ajoutez plus de tests ici selon les besoins...
});
