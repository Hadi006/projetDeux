import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { Router } from '@angular/router';
import { DescriptionPanelComponent } from '@app/components/description-panel/description-panel.component';
import { HostService } from '@app/services/host.service';
import { PublicQuizzesService } from '@app/services/public-quizzes.service';
import { TEST_QUIZZES } from '@common/constant';
import { Quiz } from '@common/quiz';
import { Subject, of } from 'rxjs';
import { GameChoicePageComponent } from './game-choice-page.component';

describe('GameChoicePageComponent', () => {
    let testQuiz: Quiz;

    let component: GameChoicePageComponent;
    let fixture: ComponentFixture<GameChoicePageComponent>;
    let publicQuizzesServiceSpy: jasmine.SpyObj<PublicQuizzesService>;
    let routerSpy: jasmine.SpyObj<Router>;
    let hostServiceSpy: jasmine.SpyObj<HostService>;

    beforeEach(async () => {
        testQuiz = JSON.parse(JSON.stringify(TEST_QUIZZES[0]));

        publicQuizzesServiceSpy = jasmine.createSpyObj('PublicQuizzesService', [
            'fetchVisibleQuizzes',
            'checkQuizAvailability',
            'alertNoQuizAvailable',
        ]);
        publicQuizzesServiceSpy.fetchVisibleQuizzes.and.returnValue(of(undefined));
        Object.defineProperty(publicQuizzesServiceSpy, 'quizzes$', {
            value: new Subject<Quiz[]>(),
        });
        routerSpy = jasmine.createSpyObj('Router', ['navigate']);
        hostServiceSpy = jasmine.createSpyObj('HostService', ['startGame', 'cleanUp', 'createLobby', 'handleSockets']);
    });

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule({
            declarations: [GameChoicePageComponent, DescriptionPanelComponent],
            providers: [
                {
                    provide: PublicQuizzesService,
                    useValue: publicQuizzesServiceSpy,
                },
                {
                    provide: HostService,
                    useValue: hostServiceSpy,
                },
                {
                    provide: Router,
                    useValue: routerSpy,
                },
            ],
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(GameChoicePageComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should call fetchVisibleQuizzes on init', (done) => {
        publicQuizzesServiceSpy.fetchVisibleQuizzes().subscribe(() => {
            expect(publicQuizzesServiceSpy.fetchVisibleQuizzes).toHaveBeenCalled();
            done();
        });
    });

    it('should set chosenGame on chooseQuiz call', () => {
        component.chooseQuiz(testQuiz);
        expect(component.chosenQuiz).toEqual(testQuiz);
    });

    it('should start game', (done) => {
        publicQuizzesServiceSpy.checkQuizAvailability.and.returnValue(of(true));
        component.chooseQuiz(testQuiz);
        hostServiceSpy.createLobby.and.returnValue(of(true));
        component.startGame();
        expect(publicQuizzesServiceSpy.checkQuizAvailability).toHaveBeenCalled();
        publicQuizzesServiceSpy.checkQuizAvailability().subscribe(() => {
            expect(routerSpy.navigate).toHaveBeenCalledWith(['lobby']);
            done();
        });
    });

    it('should not start game if no quiz is chosen', (done) => {
        publicQuizzesServiceSpy.checkQuizAvailability.and.returnValue(of(true));
        component.startGame();
        hostServiceSpy.createLobby.and.returnValue(of(true));
        component.startGame();
        publicQuizzesServiceSpy.checkQuizAvailability().subscribe(() => {
            expect(publicQuizzesServiceSpy.alertNoQuizAvailable).toHaveBeenCalledWith('Aucun quiz sélectionné');
            done();
        });
    });

    it('should not start game if quiz is not available', (done) => {
        publicQuizzesServiceSpy.checkQuizAvailability.and.returnValue(of(false));
        component.chooseQuiz(testQuiz);
        component.startGame();
        publicQuizzesServiceSpy.checkQuizAvailability().subscribe(() => {
            expect(publicQuizzesServiceSpy.alertNoQuizAvailable).toHaveBeenCalledWith('Quiz non disponible, veuillez en choisir un autre');
            done();
        });
    });

    it('should not start game if lobby creation fails', (done) => {
        publicQuizzesServiceSpy.checkQuizAvailability.and.returnValue(of(true));
        component.chooseQuiz(testQuiz);
        hostServiceSpy.createLobby.and.returnValue(of(false));
        component.startGame();
        publicQuizzesServiceSpy.checkQuizAvailability().subscribe(() => {
            expect(publicQuizzesServiceSpy.alertNoQuizAvailable).toHaveBeenCalledWith('Nombre maximum de jeux atteint');
            done();
        });
    });

    it('should test game', (done) => {
        publicQuizzesServiceSpy.checkQuizAvailability.and.returnValue(of(true));
        component.chooseQuiz(testQuiz);
        hostServiceSpy.createLobby.and.returnValue(of(true));
        component.testGame();
        publicQuizzesServiceSpy.checkQuizAvailability().subscribe(() => {
            expect(routerSpy.navigate).toHaveBeenCalledWith(['test']);
            done();
        });
    });

    it('should not test game if no quiz is chosen', (done) => {
        publicQuizzesServiceSpy.checkQuizAvailability.and.returnValue(of(true));
        component.testGame();
        publicQuizzesServiceSpy.checkQuizAvailability().subscribe(() => {
            expect(publicQuizzesServiceSpy.alertNoQuizAvailable).toHaveBeenCalledWith('Aucun quiz sélectionné');
            done();
        });
    });

    it('should not test game if quiz is not available', (done) => {
        publicQuizzesServiceSpy.checkQuizAvailability.and.returnValue(of(false));
        component.chooseQuiz(testQuiz);
        component.testGame();
        publicQuizzesServiceSpy.checkQuizAvailability().subscribe(() => {
            expect(publicQuizzesServiceSpy.alertNoQuizAvailable).toHaveBeenCalledWith('Quiz non disponible, veuillez en choisir un autre');
            done();
        });
    });

    it('should not test game if lobby creation fails', (done) => {
        publicQuizzesServiceSpy.checkQuizAvailability.and.returnValue(of(true));
        component.chooseQuiz(testQuiz);
        hostServiceSpy.createLobby.and.returnValue(of(false));
        component.testGame();
        publicQuizzesServiceSpy.checkQuizAvailability().subscribe(() => {
            expect(publicQuizzesServiceSpy.alertNoQuizAvailable).toHaveBeenCalledWith('Nombre maximum de jeux atteint');
            done();
        });
    });
});
