import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { ChatboxComponent } from '@app/components/chatbox/chatbox.component';
import { GameCountDownComponent } from '@app/components/game-count-down/game-count-down.component';
import { HistogramComponent } from '@app/components/histogram/histogram.component';
import { HostService } from '@app/services/host/host.service';
import { QCM_TIME_FOR_PANIC, QRL_TIME_FOR_PANIC, TEST_GAME_DATA, TEST_HISTOGRAM_DATA, TEST_QUESTIONS } from '@common/constant';
import { Game } from '@common/game';
import { Player } from '@common/player';
import { Subject } from 'rxjs';

import { HostGamePageComponent } from './host-game-page.component';

describe('HostGamePageComponent', () => {
    let component: HostGamePageComponent;
    let fixture: ComponentFixture<HostGamePageComponent>;
    let hostServiceSpy: jasmine.SpyObj<HostService>;
    let dialogSpy: jasmine.SpyObj<MatDialog>;
    let routerSpy: jasmine.SpyObj<Router>;
    let testGame: Game;
    let testPlayer: Player;

    beforeEach(() => {
        testGame = JSON.parse(JSON.stringify(TEST_GAME_DATA));
        testPlayer = JSON.parse(JSON.stringify(TEST_GAME_DATA.players[0]));

        hostServiceSpy = jasmine.createSpyObj('HostService', [
            'isConnected',
            'getCurrentQuestion',
            'getTime',
            'nextQuestion',
            'getGame',
            'endGame',
            'mute',
            'updatePlayers',
        ]);
        Object.defineProperty(hostServiceSpy, 'game', {
            get: () => {
                return testGame;
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
        spyOnProperty(hostServiceSpy, 'game').and.returnValue(null);
        hostServiceSpy.questionEndedSubject.subscribe(() => {
            expect(component.shouldOpenEvaluationForm).toBeFalse();
            done();
        });
        hostServiceSpy.questionEndedSubject.next();
    });

    it('should get the players', () => {
        expect(component.getPlayers()).toEqual(testGame.players);
    });

    it('should return empty array if game is undefined', () => {
        spyOnProperty(hostServiceSpy, 'game').and.returnValue(null);
        expect(component.getPlayers()).toEqual([]);
    });

    it('should get the real current question', () => {
        expect(component.getTheRealCurrentQuestion()).toBeUndefined();
    });

    it('should not get the real current question if game is undefined', () => {
        spyOnProperty(hostServiceSpy, 'game').and.returnValue(null);
        expect(component.getTheRealCurrentQuestion()).toBeUndefined();
    });

    it('stopCountDown should set isCountingDown to false', () => {
        component.stopCountDown();
        expect(component.isCountingDown).toBeFalse();
    });

    it('getGame should return the game from the hostService', () => {
        expect(component.game).toEqual(testGame);
    });

    it('getCurrentQuestion should return the current question from the hostService', () => {
        hostServiceSpy.getCurrentQuestion.and.returnValue(testGame.quiz?.questions[0]);
        expect(component.getCurrentQuestion()).toEqual(testGame.quiz?.questions[0]);
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
        component.sortBy('name');
        component.sortBy('name');
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

    it('should return black', () => {
        testPlayer.hasLeft = true;
        expect(component.getColor(testPlayer)).toEqual('black');
    });

    it('should return green', () => {
        testPlayer.hasConfirmedAnswer = true;
        expect(component.getColor(testPlayer)).toEqual('green');
    });

    it('should return yellow', () => {
        testPlayer.hasInteracted = true;
        expect(component.getColor(testPlayer)).toEqual('yellow');
    });

    it('should return red', () => {
        expect(component.getColor(testPlayer)).toEqual('red');
    });

    it('should mute player', () => {
        component.mutePlayer(testPlayer.name);
        expect(hostServiceSpy.mute).toHaveBeenCalledWith(testPlayer.name);
    });

    it('should get current player', () => {
        expect(JSON.parse(JSON.stringify(component.getCurrentPlayer()))).toEqual(testPlayer);
    });

    it('should not get current player if game is undefined', () => {
        spyOnProperty(hostServiceSpy, 'game').and.returnValue(null);
        expect(component.getCurrentPlayer()).toEqual(new Player('', ''));
    });

    it('should update player score', () => {
        spyOn(component, 'getTheRealCurrentQuestion').and.returnValue(TEST_QUESTIONS[0]);
        component.updatePlayerScore(1);
        expect(testGame.players[0].score).toEqual(TEST_QUESTIONS[0].points);
    });

    it('should update player score if current question is undefined', () => {
        spyOn(component, 'getTheRealCurrentQuestion').and.returnValue(undefined);
        component.updatePlayerScore(1);
        expect(testGame.players[0].score).toEqual(0);
    });

    it('should not update player score if game is undefined', () => {
        spyOnProperty(hostServiceSpy, 'game').and.returnValue(null);
        component.updatePlayerScore(1);
        expect(testGame.players[0].score).toEqual(0);
    });

    it('should increment current player index', () => {
        component.nextPlayer();
        expect(component.currentPlayerIndex).toEqual(1);
    });

    it('should not increment current player index if game is undefined', () => {
        spyOnProperty(hostServiceSpy, 'game').and.returnValue(null);
        component.nextPlayer();
        expect(component.currentPlayerIndex).toEqual(0);
    });

    it('should check if it is the last player', () => {
        expect(component.isTheLastPlayer()).toBeFalse();
    });

    it('should not check if it is the last player if game is undefined', () => {
        spyOnProperty(hostServiceSpy, 'game').and.returnValue(null);
        expect(component.isTheLastPlayer()).toBeFalse();
    });

    it('should send evaluation results', () => {
        component.sendEvaluationResults();
        expect(hostServiceSpy.updatePlayers).toHaveBeenCalled();
    });

    it('should not send evaluation results if game is undefined', () => {
        spyOnProperty(hostServiceSpy, 'game').and.returnValue(null);
        component.sendEvaluationResults();
        expect(hostServiceSpy.updatePlayers).not.toHaveBeenCalled();
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
    it('canActivatePanicMode should return true if current question type is QCM and time is >= 5', () => {
        spyOn(component, 'getCurrentQuestion').and.returnValue(TEST_GAME_DATA.quiz.questions[0]);
        spyOn(component, 'getTime').and.returnValue(QCM_TIME_FOR_PANIC);

        expect(component.canActivatePanicMode()).toBeTrue();
    });

    it('canActivatePanicMode should return true if current question type is QRL and time is >= 20', () => {
        spyOn(component, 'getCurrentQuestion').and.returnValue(TEST_GAME_DATA.quiz.questions[1]);
        spyOn(component, 'getTime').and.returnValue(QRL_TIME_FOR_PANIC);

        expect(component.canActivatePanicMode()).toBeTrue();
    });

    it('canActivatePanicMode should return false if current question type is not QCM or QRL', () => {
        spyOn(component, 'getCurrentQuestion').and.returnValue(TEST_GAME_DATA.quiz.questions[0]);
        spyOn(component, 'getTime').and.returnValue(3);

        expect(component.canActivatePanicMode()).toBeFalse();
    });

    it('canActivatePanicMode should return false if time is less than 5 for QCM', () => {
        spyOn(component, 'getCurrentQuestion').and.returnValue(TEST_GAME_DATA.quiz.questions[0]);
        spyOn(component, 'getTime').and.returnValue(QCM_TIME_FOR_PANIC - 1);

        expect(component.canActivatePanicMode()).toBeFalse();
    });

    it('canActivatePanicMode should return false if time is less than 20 for QRL', () => {
        spyOn(component, 'getCurrentQuestion').and.returnValue(TEST_GAME_DATA.quiz.questions[0]);
        spyOn(component, 'getTime').and.returnValue(QRL_TIME_FOR_PANIC - 1);

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
