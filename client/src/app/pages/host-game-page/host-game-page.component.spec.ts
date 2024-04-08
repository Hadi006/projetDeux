import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { MatDialog } from '@angular/material/dialog';
import { ChatboxComponent } from '@app/components/chatbox/chatbox.component';
import { GameCountDownComponent } from '@app/components/game-count-down/game-count-down.component';
import { HistogramComponent } from '@app/components/histogram/histogram.component';
import { HostService } from '@app/services/host/host.service';
import { WebSocketService } from '@app/services/web-socket/web-socket.service';
import { TEST_GAME_DATA, TEST_HISTOGRAM_DATA } from '@common/constant';
import { Subject } from 'rxjs';

import { HostGamePageComponent } from './host-game-page.component';

describe('HostGamePageComponent', () => {
    let component: HostGamePageComponent;
    let fixture: ComponentFixture<HostGamePageComponent>;
    let hostServiceSpy: jasmine.SpyObj<HostService>;
    let dialogSpy: jasmine.SpyObj<MatDialog>;
    let websocketServiceSpy: jasmine.SpyObj<WebSocketService>;

    beforeEach(() => {
        hostServiceSpy = jasmine.createSpyObj('HostService', [
            'getCurrentQuestion',
            'getTime',
            'questionEnded',
            'nextQuestion',
            'getGame',
            'leaveGame',
            'endGame',
        ]);
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
        Object.defineProperty(hostServiceSpy, 'histograms', {
            get: () => {
                return TEST_HISTOGRAM_DATA;
            },
            configurable: true,
        });

        dialogSpy = jasmine.createSpyObj('MatDialog', ['open']);
        websocketServiceSpy = jasmine.createSpyObj('WebSocketService', ['onEvent']);
    });

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule({
            declarations: [HostGamePageComponent, GameCountDownComponent, HistogramComponent, ChatboxComponent],
            providers: [
                { provide: HostService, useValue: hostServiceSpy },
                { provide: MatDialog, useValue: dialogSpy },
                { provide: WebSocketService, useValue: websocketServiceSpy },
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

    it('should alert and leave game when gameEndedSubject is triggered', (done) => {
        hostServiceSpy.gameEndedSubject.subscribe(() => {
            expect(dialogSpy.open).toHaveBeenCalled();
            expect(hostServiceSpy.leaveGame).toHaveBeenCalled();
            done();
        });
        hostServiceSpy.gameEndedSubject.next();
    });

    it('stopCountDown should set isCountingDown to false', () => {
        component.stopCountDown();
        expect(component.isCountingDown).toBeFalse();
    });

    it('getGame should return the game from the hostService', () => {
        expect(component.getGame()).toEqual(TEST_GAME_DATA);
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

    it('getPlayers should return the players from the hostService', () => {
        const players = TEST_GAME_DATA.players;
        expect(component.getPlayers()).toEqual(players);
    });

    it('getQuitters should return the quitters from the hostService', () => {
        Object.defineProperty(hostServiceSpy, 'quitters', {
            get: () => {
                return TEST_GAME_DATA.players;
            },
            configurable: true,
        });
        expect(component.getQuitters()).toEqual(TEST_GAME_DATA.players);
    });

    it('should call leaveGame on the hostService when leaveGame is called', () => {
        component.leaveGame();
        expect(hostServiceSpy.leaveGame).toHaveBeenCalled();
    });

    it('should unsubscribe on destroy', () => {
        component.ngOnDestroy();
        hostServiceSpy.gameEndedSubject.subscribe(() => {
            expect(dialogSpy.open).not.toHaveBeenCalled();
            expect(hostServiceSpy.leaveGame).not.toHaveBeenCalled();
        });
        hostServiceSpy.gameEndedSubject.next();
    });
    it('canActivatePanicMode should return true if current question type is QCM and time is >= 5', () => {
        spyOn(component, 'getCurrentQuestion').and.returnValue(TEST_GAME_DATA.quiz.questions[0]);
        spyOn(component, 'getTime').and.returnValue(5);

        expect(component.canActivatePanicMode()).toBeTrue();
    });

    it('canActivatePanicMode should return true if current question type is QRL and time is >= 20', () => {
        spyOn(component, 'getCurrentQuestion').and.returnValue(TEST_GAME_DATA.quiz.questions[1]);
        spyOn(component, 'getTime').and.returnValue(20);

        expect(component.canActivatePanicMode()).toBeTrue();
    });

    it('canActivatePanicMode should return false if current question type is not QCM or QRL', () => {
        spyOn(component, 'getCurrentQuestion').and.returnValue(TEST_GAME_DATA.quiz.questions[0]);
        spyOn(component, 'getTime').and.returnValue(3);

        expect(component.canActivatePanicMode()).toBeFalse();
    });

    it('canActivatePanicMode should return false if time is less than 5 for QCM', () => {
        spyOn(component, 'getCurrentQuestion').and.returnValue(TEST_GAME_DATA.quiz.questions[0]);
        spyOn(component, 'getTime').and.returnValue(4);

        expect(component.canActivatePanicMode()).toBeFalse();
    });

    it('canActivatePanicMode should return false if time is less than 20 for QRL', () => {
        spyOn(component, 'getCurrentQuestion').and.returnValue(TEST_GAME_DATA.quiz.questions[1]);
        spyOn(component, 'getTime').and.returnValue(19);

        expect(component.canActivatePanicMode()).toBeFalse();
    });

    it('pauseTimer should call pauseTimer on hostService', () => {
        component.pauseTimer();
        expect(hostServiceSpy.pauseTimer).toHaveBeenCalled();
    });

    it('startPanicMode should call startPanicMode on hostService', () => {
        component.startPanicMode();
        expect(hostServiceSpy.startPanicMode).toHaveBeenCalled();
    });

    it('stopPanicMode should call stopPanicMode on hostService', () => {
        component.stopPanicMode();
        expect(hostServiceSpy.stopPanicMode).toHaveBeenCalled();
    });
});
