import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router, convertToParamMap } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { QuestionsPageComponent } from './questions-page.component';

describe('QuestionsPageComponent', () => {
    let component: QuestionsPageComponent;
    let fixture: ComponentFixture<QuestionsPageComponent>;
    let router: Router;
    let activatedRouteMock: jasmine.SpyObj<ActivatedRoute>;

    beforeEach(async () => {
        activatedRouteMock = jasmine.createSpyObj<ActivatedRoute>('ActivatedRoute', ['snapshot']);

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

    it('should initialize questions for Math game by default', () => {
        expect(component.jeu).toEqual('Math');
        expect(component.questions.length).toBeGreaterThan(0);
    });

    const games = [
        { type: 'Math', expectedQuestion: '1+1' },
        { type: 'Science', expectedQuestion: 'Unité de base de la vie' },
        { type: 'Programmation', expectedQuestion: 'boucle "for" en programmation' },
        { type: 'Histoire', expectedQuestion: 'Le premier empereur de Rome' },
        { type: 'Physique', expectedQuestion: 'Quelle est la vitesse de la lumière' },
    ];

    games.forEach((game) => {
        it(`should initialize questions for ${game.type} game`, () => {
            activatedRouteMock.snapshot.paramMap = convertToParamMap({ jeu: game.type });

            fixture = TestBed.createComponent(QuestionsPageComponent);
            component = fixture.componentInstance;
            fixture.detectChanges();
            expect(component.jeu).toEqual(game.type);
            expect(component.questions).toContain(game.expectedQuestion);
        });
    });

    it('should set selectedQuestion on selectQuestion call', () => {
        const question = '1+1';
        const mockEvent = { currentTarget: { classList: { add: jasmine.createSpy('add') } } };
        component.selectQuestion(question, mockEvent);
        expect(component.selectedQuestion).toEqual(question);
        expect(mockEvent.currentTarget.classList.add).toHaveBeenCalledWith('selected');
    });

    it('should navigate to game on goBack', () => {
        const navigateSpy = spyOn(router, 'navigate');
        component.goBack();
        expect(navigateSpy).toHaveBeenCalledWith(['game']);
    });
});
