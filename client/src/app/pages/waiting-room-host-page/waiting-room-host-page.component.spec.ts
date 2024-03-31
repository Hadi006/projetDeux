import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { Router } from '@angular/router';
import { ChatboxComponent } from '@app/components/chatbox/chatbox.component';
import { GameCountDownComponent } from '@app/components/game-count-down/game-count-down.component';
import { WaitingRoomInfoComponent } from '@app/components/waiting-room-info/waiting-room-info.component';
import { WaitingRoomHostPageComponent } from '@app/pages/waiting-room-host-page/waiting-room-host-page.component';
import { HostService } from '@app/services/host/host.service';
import { WebSocketService } from '@app/services/web-socket/web-socket.service';
import { START_GAME_COUNTDOWN, TEST_GAME_DATA } from '@common/constant';
import { Subject } from 'rxjs';

describe('WaitingRoomHostPageComponent', () => {
    let component: WaitingRoomHostPageComponent;
    let fixture: ComponentFixture<WaitingRoomHostPageComponent>;
    let hostServiceSpy: jasmine.SpyObj<HostService>;
    let routerSpy: jasmine.SpyObj<Router>;
    let websocketServiceSpy: jasmine.SpyObj<WebSocketService>;

    beforeEach(() => {
        hostServiceSpy = jasmine.createSpyObj('HostService', ['isConnected', 'cleanUp', 'startGame', 'handleSockets', 'toggleLock', 'kick']);
        Object.defineProperty(hostServiceSpy, 'game', { get: () => TEST_GAME_DATA, configurable: true });

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
});
