import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { ChatboxComponent } from '@app/components/chatbox/chatbox.component';
import { GameTimersComponent } from '@app/components/game-timers/game-timers.component';
import { QuestionComponent } from '@app/components/question/question.component';
import { GameplayPlayerPageComponent } from '@app/pages/gameplay-player-page/gameplay-player-page.component';
import { Router } from '@angular/router';
import { PlayerHandlerService } from '@app/services/player-handler.service';
import { HostService } from '@app/services/host.service';
import { LobbyData } from '@common/lobby-data';
import { Quiz } from '@common/quiz';
import { of } from 'rxjs';

describe('GameplayPlayerPageComponent', () => {
    const TEST_QUIZ: Quiz = {
        id: '1',
        title: 'Test Quiz',
        visible: true,
        description: 'Test Quiz Description',
        duration: 10,
        lastModification: new Date(),
        questions: [],
    };

    const TEST_LOBBY_DATA: LobbyData = {
        id: '1',
        players: [],
        quiz: { ...TEST_QUIZ },
        locked: false,
    };

    let component: GameplayPlayerPageComponent;
    let fixture: ComponentFixture<GameplayPlayerPageComponent>;
    let playerHandlerServiceSpy: jasmine.SpyObj<PlayerHandlerService>;
    let hostServiceSpy: jasmine.SpyObj<HostService>;
    let routerSpy: jasmine.SpyObj<Router>;

    beforeEach(() => {
        playerHandlerServiceSpy = jasmine.createSpyObj('PlayerHandlerService', ['handleSockets', 'createPlayer', 'cleanUp', 'getTime']);
        playerHandlerServiceSpy.createPlayer.and.returnValue(of(''));
        hostServiceSpy = jasmine.createSpyObj('HostService', ['startGame', 'cleanUp']);
        Object.defineProperty(hostServiceSpy, 'lobbyData', { get: () => TEST_LOBBY_DATA, configurable: true });
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

    it('ngOnInit should navigate to game page if there is no quiz', () => {
        hostServiceSpy.lobbyData.quiz = undefined;
        component.ngOnInit();
        expect(routerSpy.navigate).toHaveBeenCalledWith(['game']);
    });

    it('ngOnInit should handle sockets, create player and start game', (done) => {
        expect(playerHandlerServiceSpy.handleSockets).toHaveBeenCalled();
        expect(playerHandlerServiceSpy.createPlayer).toHaveBeenCalledWith(TEST_LOBBY_DATA.id, 'Test');
        playerHandlerServiceSpy.createPlayer('1', 'test').subscribe(() => {
            expect(hostServiceSpy.startGame).toHaveBeenCalledWith(0);
            done();
        });
    });

    it('ngOnDestroy should clean up', () => {
        component.ngOnDestroy();
        expect(hostServiceSpy.cleanUp).toHaveBeenCalled();
        expect(playerHandlerServiceSpy.cleanUp).toHaveBeenCalled();
    });
});
