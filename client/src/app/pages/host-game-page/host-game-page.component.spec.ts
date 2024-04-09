import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { ChatboxComponent } from '@app/components/chatbox/chatbox.component';
import { GameCountDownComponent } from '@app/components/game-count-down/game-count-down.component';
import { HistogramComponent } from '@app/components/histogram/histogram.component';
import { HostService } from '@app/services/host/host.service';
import { TEST_GAME_DATA, TEST_HISTOGRAM_DATA, TEST_QUESTIONS } from '@common/constant';
import { Subject } from 'rxjs';

import { HostGamePageComponent } from './host-game-page.component';

describe('HostGamePageComponent', () => {
    let component: HostGamePageComponent;
    let fixture: ComponentFixture<HostGamePageComponent>;
    let hostServiceSpy: jasmine.SpyObj<HostService>;
    let dialogSpy: jasmine.SpyObj<MatDialog>;
    let routerSpy: jasmine.SpyObj<Router>;

    beforeEach(() => {
        hostServiceSpy = jasmine.createSpyObj('HostService', ['isConnected', 'getCurrentQuestion', 'getTime', 'nextQuestion', 'getGame', 'endGame']);
        Object.defineProperty(hostServiceSpy, 'game', {
            get: () => {
                return TEST_GAME_DATA;
            },
            configurable: true,
        });
        const gameEndedSubject = new Subject<void>();
        Object.defineProperty(hostServiceSpy, 'gameEndedSubject', {
            get: () => {
                return gameEndedSubject;
            },
            configurable: true,
        });
        const questionEndedSubject = new Subject<void>();
        Object.defineProperty(hostServiceSpy, 'questionEndedSubject', {
            get: () => {
                return questionEndedSubject;
            },
            configurable: true,
        });
        Object.defineProperty(hostServiceSpy, 'histograms', {
            get: () => {
                return TEST_HISTOGRAM_DATA;
            },
            configurable: true,
        });

        dialogSpy = jasmine.createSpyObj('MatDialog', ['open']);

        const eventSubject = new Subject<void>();
        routerSpy = jasmine.createSpyObj('Router', ['navigate']);
        Object.defineProperty(routerSpy, 'events', {
            get: () => {
                return eventSubject;
            },
            configurable: true,
        });
    });

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule({
            declarations: [HostGamePageComponent, GameCountDownComponent, HistogramComponent, ChatboxComponent],
            providers: [
                { provide: HostService, useValue: hostServiceSpy },
                { provide: MatDialog, useValue: dialogSpy },
                { provide: Router, useValue: routerSpy },
            ],
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(HostGamePageComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should open a dialog if game abruptly ends', (done) => {
        hostServiceSpy.gameEndedSubject.subscribe(() => {
            expect(dialogSpy.open).toHaveBeenCalled();
            expect(routerSpy.navigate).toHaveBeenCalled();
            done();
        });
        hostServiceSpy.gameEndedSubject.next();
    });

    it('should open evaluation form if current question is QRL', (done) => {
        spyOn(component, 'getTheRealCurrentQuestion').and.returnValue(TEST_QUESTIONS[1]);
        hostServiceSpy.questionEndedSubject.subscribe(() => {
            expect(component.shouldOpenEvaluationForm).toBeTrue();
            done();
        });
        hostServiceSpy.questionEndedSubject.next();
    });

    it('should do nothing if game is undefined', (done) => {
        Object.defineProperty(hostServiceSpy, 'game', {
            get: () => {
                return undefined;
            },
            configurable: true,
        });
        hostServiceSpy.questionEndedSubject.subscribe(() => {
            expect(component.shouldOpenEvaluationForm).toBeFalse();
            done();
        });
        hostServiceSpy.questionEndedSubject.next();
    });

    it('should get the real current question', () => {
        expect(component.getTheRealCurrentQuestion()).toBeUndefined();
    });

    it('should not get the real current question if game is undefined', () => {
        Object.defineProperty(hostServiceSpy, 'game', {
            get: () => {
                return undefined;
            },
            configurable: true,
        });
        expect(component.getTheRealCurrentQuestion()).toBeUndefined();
    });

    it('stopCountDown should set isCountingDown to false', () => {
        component.stopCountDown();
        expect(component.isCountingDown).toBeFalse();
    });

    it('getGame should return the game from the hostService', () => {
        expect(component.game).toEqual(TEST_GAME_DATA);
    });

    it('getCurrentQuestion should return the current question from the hostService', () => {
        hostServiceSpy.getCurrentQuestion.and.returnValue(TEST_GAME_DATA.quiz?.questions[0]);
        expect(component.getCurrentQuestion()).toEqual(TEST_GAME_DATA.quiz?.questions[0]);
    });

    it('getTime should return the time from the hostService', () => {
        const time = 10;
        hostServiceSpy.getTime.and.returnValue(time);
        expect(component.getTime()).toEqual(time);
    });

    it('getQuestionEnded should return the questionEnded from the hostService', () => {
        Object.defineProperty(hostServiceSpy, 'questionEnded', {
            get: () => {
                return true;
            },
            configurable: true,
        });
        expect(component.getQuestionEnded()).toBeTrue();
    });

    it('nextQuestion should call nextQuestion on the hostService', () => {
        component.nextQuestion();
        expect(hostServiceSpy.nextQuestion).toHaveBeenCalled();
    });

    it('showEndGameResult should end game', () => {
        component.showEndGameResult();
        expect(hostServiceSpy.endGame).toHaveBeenCalled();
    });

    it('should sort in ascending', () => {
        expect(component.sort).toEqual('name');
        expect(component.order).toEqual('asc');
    });

    it('should sort in descending', () => {
        component.sortBy('name');
        expect(component.sort).toEqual('name');
        expect(component.order).toEqual('desc');
    });

    it('should change sort', () => {
        component.sortBy('score');
        expect(component.sort).toEqual('score');
        expect(component.order).toEqual('asc');
    });

    it('should navigate to home if not connected or no current question', () => {
        hostServiceSpy.isConnected.and.returnValue(true);
        hostServiceSpy.getCurrentQuestion.and.returnValue(undefined);
        component.ngOnInit();
        expect(routerSpy.navigate).toHaveBeenCalled();
    });

    it('should unsubscribe on destroy', () => {
        component.ngOnDestroy();
        hostServiceSpy.gameEndedSubject.subscribe(() => {
            expect(dialogSpy.open).not.toHaveBeenCalled();
        });
        hostServiceSpy.gameEndedSubject.next();
    });
});
