import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { ChatboxComponent } from '@app/components/chatbox/chatbox.component';
import { GameTimersComponent } from '@app/components/game-timers/game-timers.component';
import { QuestionComponent } from '@app/components/question/question.component';
import { GameplayPlayerPageComponent } from '@app/pages/gameplay-player-page/gameplay-player-page.component';
import { Router } from '@angular/router';
import { PlayerHandlerService } from '@app/services/player-handler.service';
import { HostService } from '@app/services/host.service';
import { LobbyData } from '@common/lobby-data';
import { of, Subject } from 'rxjs';
import { TEST_LOBBY_DATA } from '@common/constant';

describe('GameplayPlayerPageComponent', () => {
    let testLobbyData: LobbyData;

    let component: GameplayPlayerPageComponent;
    let fixture: ComponentFixture<GameplayPlayerPageComponent>;
    let playerHandlerServiceSpy: jasmine.SpyObj<PlayerHandlerService>;
    let hostServiceSpy: jasmine.SpyObj<HostService>;
    let routerSpy: jasmine.SpyObj<Router>;

    beforeEach(() => {
        testLobbyData = JSON.parse(JSON.stringify(TEST_LOBBY_DATA));

        playerHandlerServiceSpy = jasmine.createSpyObj('PlayerHandlerService', ['handleSockets', 'createPlayer', 'cleanUp', 'getTime']);
        playerHandlerServiceSpy.createPlayer.and.returnValue(of(''));

        const questionEndedSubject = new Subject<void>();
        const gameEndedSubject = new Subject<void>();
        hostServiceSpy = jasmine.createSpyObj('HostService', ['startGame', 'cleanUp', 'nextQuestion']);
        Object.defineProperty(hostServiceSpy, 'questionEndedSubject', { get: () => questionEndedSubject });
        Object.defineProperty(hostServiceSpy, 'gameEndedSubject', { get: () => gameEndedSubject });
        Object.defineProperty(hostServiceSpy, 'lobbyData', { get: () => testLobbyData, configurable: true });

        routerSpy = jasmine.createSpyObj('Router', ['navigate']);
    });

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule({
            declarations: [GameplayPlayerPageComponent, GameTimersComponent, QuestionComponent, ChatboxComponent],
            providers: [
                { provide: PlayerHandlerService, useValue: playerHandlerServiceSpy },
                { provide: HostService, useValue: hostServiceSpy },
                { provide: Router, useValue: routerSpy },
            ],
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(GameplayPlayerPageComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should navigate to the next question on question ended', (done) => {
        hostServiceSpy.questionEndedSubject.subscribe(() => {
            expect(hostServiceSpy.nextQuestion).toHaveBeenCalled();
            done();
        });

        hostServiceSpy.questionEndedSubject.next();
    });

    it('should navigate to game page on game ended', (done) => {
        hostServiceSpy.gameEndedSubject.subscribe(() => {
            expect(routerSpy.navigate).toHaveBeenCalledWith(['game']);
            done();
        });

        hostServiceSpy.gameEndedSubject.next();
    });

    it('ngOnInit should navigate to game page if there is no quiz', () => {
        hostServiceSpy.lobbyData.quiz = undefined;
        component.ngOnInit();
        expect(routerSpy.navigate).toHaveBeenCalledWith(['game']);
    });

    it('ngOnInit should handle sockets, create player and start game', (done) => {
        expect(playerHandlerServiceSpy.handleSockets).toHaveBeenCalled();
        expect(playerHandlerServiceSpy.createPlayer).toHaveBeenCalledWith(testLobbyData.id, 'Test');
        playerHandlerServiceSpy.createPlayer('1', 'test').subscribe(() => {
            expect(hostServiceSpy.startGame).toHaveBeenCalledWith(0);
            done();
        });
    });

    it('ngOnDestroy should clean up', () => {
        component.ngOnDestroy();
        expect(hostServiceSpy.cleanUp).toHaveBeenCalled();
        expect(playerHandlerServiceSpy.cleanUp).toHaveBeenCalled();
        hostServiceSpy.questionEndedSubject.next();
        hostServiceSpy.gameEndedSubject.next();
        expect(hostServiceSpy.nextQuestion).not.toHaveBeenCalledTimes(2);
        expect(routerSpy.navigate).not.toHaveBeenCalledTimes(2);
    });
});
