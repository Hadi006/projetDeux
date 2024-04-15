import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { HostService } from '@app/services/host/host.service';
import { PlayerService } from '@app/services/player/player.service';
import { WebSocketService } from '@app/services/web-socket/web-socket.service';
import { RANDOM_QUIZ_ID, TEST_GAME_DATA } from '@common/constant';
import { Subject, of } from 'rxjs';
import { WaitingRoomHostPageComponent } from './waiting-room-host-page.component';

describe('WaitingRoomHostPageComponent', () => {
    let component: WaitingRoomHostPageComponent;
    let fixture: ComponentFixture<WaitingRoomHostPageComponent>;
    let hostServiceSpy: jasmine.SpyObj<HostService>;
    let routerSpy: jasmine.SpyObj<Router>;
    let websocketServiceSpy: jasmine.SpyObj<WebSocketService>;
    let playerServiceSpy: jasmine.SpyObj<PlayerService>;

    beforeEach(async () => {
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

        routerSpy = jasmine.createSpyObj('Router', ['navigate']);

        await TestBed.configureTestingModule({
            declarations: [WaitingRoomHostPageComponent],
            providers: [
                { provide: HostService, useValue: hostServiceSpy },
                { provide: PlayerService, useValue: playerServiceSpy },
                { provide: Router, useValue: routerSpy },
                { provide: WebSocketService, useValue: websocketServiceSpy },
            ],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(WaitingRoomHostPageComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
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

    it('should navigate to root if not connected or game is locked', () => {
        hostServiceSpy.isConnected.and.returnValue(false);
        component.ngOnInit();
        expect(routerSpy.navigate).toHaveBeenCalledWith(['/']);
    });

    it('should toggle lock', () => {
        component.toggleLock();
        expect(hostServiceSpy.toggleLock).toHaveBeenCalled();
    });

    it('should kick player', () => {
        component.kick('player1');
        expect(hostServiceSpy.kick).toHaveBeenCalledWith('player1');
    });

    it('should start game', () => {
        component.startGame();
        expect(routerSpy.navigate).toHaveBeenCalledWith(['game-host']);
        expect(hostServiceSpy.startGame).toHaveBeenCalled();
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
