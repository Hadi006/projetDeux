import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { GameChoicePageComponent } from './game-choice-page.component';
import { GameHandlerService } from '@app/services/game-handler.service';
import { Quiz } from '@common/quiz';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { PublicQuizzesService } from '@app/services/public-quizzes.service';
import { Subject } from 'rxjs';

describe('GameChoicePageComponent', () => {
    let component: GameChoicePageComponent;
    let fixture: ComponentFixture<GameChoicePageComponent>;
    let router: Router;
    let gameHandlerServiceSpy: jasmine.SpyObj<GameHandlerService>;
    let publicQuizzesServiceSpy: jasmine.SpyObj<PublicQuizzesService>;
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
        publicQuizzesServiceSpy = jasmine.createSpyObj('PublicQuizzesService', ['fetchVisibleQuizzes']);
        Object.defineProperty(publicQuizzesServiceSpy, 'quizzes$', {
            value: new Subject<Quiz[]>(),
        });
    });

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule({
            imports: [RouterTestingModule, HttpClientTestingModule],
            declarations: [GameChoicePageComponent],
            providers: [
                { provide: GameHandlerService, useValue: gameHandlerServiceSpy },
                {
                    provide: PublicQuizzesService,
                    useValue: publicQuizzesServiceSpy,
                },
            ],
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

    it('should set quizzes on fetchVisibleQuizzes call', () => {
        publicQuizzesServiceSpy.quizzes$.next([mockQuiz]);
        expect(component.quizzes).toEqual([mockQuiz]);
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

    it('should unsubscribe on destroy', () => {
        component.quizzes = [];
        component.ngOnDestroy();
        publicQuizzesServiceSpy.quizzes$.next([mockQuiz]);
        expect(component.quizzes).toEqual([]);
    });
});
