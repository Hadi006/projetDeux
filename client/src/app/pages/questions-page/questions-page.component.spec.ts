import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { QuestionsPageComponent } from './questions-page.component';

describe('QuestionsPageComponent', () => {
    let component: QuestionsPageComponent;
    let fixture: ComponentFixture<QuestionsPageComponent>;
    let router: Router;
    let activatedRouteMock: jasmine.SpyObj<ActivatedRoute>;

    beforeEach(async () => {
        activatedRouteMock = jasmine.createSpyObj<ActivatedRoute>('ActivatedRoute', ['snapshot']);
        Object.defineProperty(activatedRouteMock.snapshot, 'paramMap', { value: { get: () => null } });

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

    it('should initialize questions to be empty', () => {
        expect(component.game).toEqual(null);
        expect(component.questions.length).toEqual(0);
    });

    it('should set selectedQuestion on selectQuestion call', () => {
        const question = 'question';
        const mockElement = document.createElement('div');
        const mockEvent = new MouseEvent('click');
        Object.defineProperty(mockEvent, 'currentTarget', { value: mockElement });
        component.toggleQuestion(question, mockEvent);
        expect(component.selectedQuestion).toEqual(question);
        expect(mockElement.classList.contains('selected')).toBeTrue();
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
            spyOn(activatedRouteMock.snapshot.paramMap, 'get').and.returnValue(game.type);
            component.ngOnInit();

            expect(component.game).toEqual(game.type);
            expect(component.questions).toContain(game.expectedQuestion);
        });
    });

    it('should navigate to game on goBack', () => {
        const navigateSpy = spyOn(router, 'navigate');
        component.goBack();
        expect(navigateSpy).toHaveBeenCalledWith(['game']);
    });

    it('should navigate to game-start on startGame', () => {
        const navigateSpy = spyOn(router, 'navigate');
        component.startGame();
        expect(navigateSpy).toHaveBeenCalledWith(['game-start']);
    });
});
