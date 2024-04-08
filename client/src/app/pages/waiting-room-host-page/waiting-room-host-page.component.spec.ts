import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { Router } from '@angular/router';
import { ChatboxComponent } from '@app/components/chatbox/chatbox.component';
import { GameCountDownComponent } from '@app/components/game-count-down/game-count-down.component';
import { WaitingRoomInfoComponent } from '@app/components/waiting-room-info/waiting-room-info.component';
import { WaitingRoomHostPageComponent } from '@app/pages/waiting-room-host-page/waiting-room-host-page.component';
import { HostService } from '@app/services/host/host.service';
import { PlayerService } from '@app/services/player/player.service';
import { WebSocketService } from '@app/services/web-socket/web-socket.service';
import { RANDOM_QUIZ_ID, START_GAME_COUNTDOWN, TEST_GAME_DATA } from '@common/constant';
import { of, Subject } from 'rxjs';

describe('WaitingRoomHostPageComponent', () => {
    let component: WaitingRoomHostPageComponent;
    let fixture: ComponentFixture<WaitingRoomHostPageComponent>;
    let hostServiceSpy: jasmine.SpyObj<HostService>;
    let playerServiceSpy: jasmine.SpyObj<PlayerService>;
    let routerSpy: jasmine.SpyObj<Router>;
    let websocketServiceSpy: jasmine.SpyObj<WebSocketService>;

    beforeEach(() => {
        hostServiceSpy = jasmine.createSpyObj('HostService', ['isConnected', 'cleanUp', 'startGame', 'handleSockets', 'toggleLock', 'kick']);
        Object.defineProperty(hostServiceSpy, 'game', { get: () => TEST_GAME_DATA, configurable: true });

        playerServiceSpy = jasmine.createSpyObj('PlayerService', ['handleSockets', 'joinGame', 'cleanUp']);

        const eventSubject = new Subject<void>();
        routerSpy = jasmine.createSpyObj('Router', ['navigate']);
        Object.defineProperty(routerSpy, 'events', {
            get: () => {
                return eventSubject;
            },
            configurable: true,
        });

        websocketServiceSpy = jasmine.createSpyObj('WebSocketService', ['onEvent']);
    });

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule({
            declarations: [WaitingRoomHostPageComponent, GameCountDownComponent, WaitingRoomInfoComponent, ChatboxComponent],
            providers: [
                { provide: HostService, useValue: hostServiceSpy },
                { provide: PlayerService, useValue: playerServiceSpy },
                { provide: Router, useValue: routerSpy },
                { provide: WebSocketService, useValue: websocketServiceSpy },
            ],
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(WaitingRoomHostPageComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should navigate to home page when disconnected', () => {
        hostServiceSpy.isConnected.and.returnValue(false);
        expect(routerSpy.navigate).toHaveBeenCalledWith(['/']);
    });

    it('should not navigate to home page when connected', () => {
        hostServiceSpy.isConnected.and.returnValue(true);
        Object.defineProperty(hostServiceSpy, 'game', { get: () => TEST_GAME_DATA, configurable: true });
        component.ngOnInit();
        expect(routerSpy.navigate).not.toHaveBeenCalledTimes(2);
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should join game as player if quiz id is -1', (done) => {
        hostServiceSpy.isConnected.and.returnValue(true);
        Object.defineProperty(hostServiceSpy, 'game', { get: () => ({ ...TEST_GAME_DATA, quiz: { id: RANDOM_QUIZ_ID } }) });
        playerServiceSpy.joinGame.and.returnValue(of('error'));
        component.ngOnInit();
        expect(playerServiceSpy.handleSockets).toHaveBeenCalled();
        playerServiceSpy.joinGame(TEST_GAME_DATA.pin, { playerName: 'Organisateur', isHost: true }).subscribe(() => {
            expect(hostServiceSpy.cleanUp).toHaveBeenCalled();
            expect(playerServiceSpy.cleanUp).toHaveBeenCalled();
            expect(routerSpy.navigate).toHaveBeenCalledWith(['/']);
            done();
        });
    });

    it('should kick player', () => {
        component.kick('player');
        expect(hostServiceSpy.kick).toHaveBeenCalledWith('player');
    });

    it('should toggle lock', () => {
        component.toggleLock();
        expect(hostServiceSpy.toggleLock).toHaveBeenCalled();
    });

    it('should start game', () => {
        component.startGame();
        expect(hostServiceSpy.startGame).toHaveBeenCalledWith(START_GAME_COUNTDOWN);
    });

    it('should not start game if game is undefined', () => {
        Object.defineProperty(hostServiceSpy, 'game', { get: () => undefined });
        component.startGame();
        expect(hostServiceSpy.startGame).not.toHaveBeenCalled();
    });

    it('should navigate to host player page if quiz id is -1', () => {
        Object.defineProperty(hostServiceSpy, 'game', { get: () => ({ ...TEST_GAME_DATA, quiz: { id: RANDOM_QUIZ_ID } }) });
        component.startGame();
        expect(routerSpy.navigate).toHaveBeenCalledWith(['host-player']);
    });
});
