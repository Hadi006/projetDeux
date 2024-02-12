import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { GameChoicePageComponent } from './game-choice-page.component';
import { GameHandlerService } from '@app/services/game-handler.service';
import { Quiz } from '@common/quiz';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { PublicQuizzesService } from '@app/services/public-quizzes.service';
import { of, Subject } from 'rxjs';

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
        gameHandlerServiceSpy = jasmine.createSpyObj('GameHandlerService', ['loadQuizData']);
        publicQuizzesServiceSpy = jasmine.createSpyObj('PublicQuizzesService', ['fetchVisibleQuizzes', 'checkQuizAvailability']);
        publicQuizzesServiceSpy.fetchVisibleQuizzes.and.returnValue(of());
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

    it('should call fetchVisibleQuizzes on init', () => {
        expect(publicQuizzesServiceSpy.fetchVisibleQuizzes).toHaveBeenCalled();
    });

    it('should set chosenGame on choisirJeu call', () => {
        component.chooseQuiz(mockQuiz);
        expect(component.chosenQuiz).toEqual(mockQuiz);
    });

    it('should navigate on startGame call', (done) => {
        const navigateSpy = spyOn(router, 'navigate');
        component.chooseQuiz(mockQuiz);
        publicQuizzesServiceSpy.checkQuizAvailability.and.returnValue(of(true));
        component.startGame();
        publicQuizzesServiceSpy.checkQuizAvailability(mockQuiz).subscribe(() => {
            expect(gameHandlerServiceSpy.loadQuizData).toHaveBeenCalledWith(mockQuiz);
            expect(navigateSpy).toHaveBeenCalledWith(['lobby']);
            done();
        });
    });

    it('should alert if game is no longer available on startGame call', () => {
        const navigateSpy = spyOn(router, 'navigate');
        component.chooseQuiz(mockQuiz);
        publicQuizzesServiceSpy.checkQuizAvailability.and.returnValue(of(false));
        component.startGame();
        publicQuizzesServiceSpy.checkQuizAvailability(mockQuiz).subscribe(() => {
            expect(gameHandlerServiceSpy.loadQuizData).not.toHaveBeenCalled();
            expect(navigateSpy).not.toHaveBeenCalled();
        });
    });

    it('should navigate on testGame call', () => {
        component.chooseQuiz(mockQuiz);
        const navigateSpy = spyOn(router, 'navigate');
        publicQuizzesServiceSpy.checkQuizAvailability.and.returnValue(of(true));
        component.testGame();
        publicQuizzesServiceSpy.checkQuizAvailability(mockQuiz).subscribe(() => {
            expect(gameHandlerServiceSpy.loadQuizData).toHaveBeenCalledWith(mockQuiz);
            expect(navigateSpy).toHaveBeenCalledWith(['/play']);
        });
    });

    it('should alert if game is no longer available on testGame call', () => {
        const navigateSpy = spyOn(router, 'navigate');
        component.chooseQuiz(mockQuiz);
        publicQuizzesServiceSpy.checkQuizAvailability.and.returnValue(of(false));
        component.testGame();
        publicQuizzesServiceSpy.checkQuizAvailability(mockQuiz).subscribe(() => {
        expect(gameHandlerServiceSpy.loadQuizData).not.toHaveBeenCalled();
        expect(navigateSpy).not.toHaveBeenCalled();
        });
    });
});
