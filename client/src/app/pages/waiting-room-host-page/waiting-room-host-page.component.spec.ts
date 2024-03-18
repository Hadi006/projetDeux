import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { Router } from '@angular/router';
import { ChatboxComponent } from '@app/components/chatbox/chatbox.component';
import { GameCountDownComponent } from '@app/components/game-count-down/game-count-down.component';
import { WaitingRoomInfoComponent } from '@app/components/waiting-room-info/waiting-room-info.component';
import { WaitingRoomHostPageComponent } from '@app/pages/waiting-room-host-page/waiting-room-host-page.component';
import { HostService } from '@app/services/host.service';
import { START_GAME_COUNTDOWN, TEST_GAME_DATA } from '@common/constant';

describe('WaitingRoomHostPageComponent', () => {
    let component: WaitingRoomHostPageComponent;
    let fixture: ComponentFixture<WaitingRoomHostPageComponent>;
    let hostServiceSpy: jasmine.SpyObj<HostService>;
    let routerSpy: jasmine.SpyObj<Router>;

    beforeEach(() => {
        hostServiceSpy = jasmine.createSpyObj('HostService', ['cleanUp', 'startGame', 'handleSockets', 'toggleLock', 'kick']);
        Object.defineProperty(hostServiceSpy, 'game', { get: () => TEST_GAME_DATA, configurable: true });
        routerSpy = jasmine.createSpyObj('Router', ['navigate']);
    });

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule({
            declarations: [WaitingRoomHostPageComponent, GameCountDownComponent, WaitingRoomInfoComponent, ChatboxComponent],
            providers: [
                { provide: HostService, useValue: hostServiceSpy },
                { provide: Router, useValue: routerSpy },
            ],
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(WaitingRoomHostPageComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
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

    it('should clean up', () => {
        component.leaveGame();
        expect(hostServiceSpy.cleanUp).toHaveBeenCalled();
        expect(routerSpy.navigate).toHaveBeenCalledWith(['/']);
    });
});
