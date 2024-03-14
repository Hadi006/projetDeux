import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { Router } from '@angular/router';
import { GameCountDownComponent } from '@app/components/game-count-down/game-count-down.component';
import { WaitingRoomHostPageComponent } from '@app/pages/lobby-organizer-page/lobby-organizer-page.component';
import { HostService } from '@app/services/host.service';
import { START_GAME_COUNTDOWN, TEST_GAME_DATA } from '@common/constant';

describe('LobbyOrganizerPageComponent', () => {
    let component: WaitingRoomHostPageComponent;
    let fixture: ComponentFixture<WaitingRoomHostPageComponent>;
    let hostServiceSpy: jasmine.SpyObj<HostService>;
    let routerSpy: jasmine.SpyObj<Router>;

    beforeEach(() => {
        hostServiceSpy = jasmine.createSpyObj('LobbyService', ['cleanUp', 'startGame', 'handleSockets']);
        Object.defineProperty(hostServiceSpy, 'lobbyData', { get: () => TEST_GAME_DATA, configurable: true });
        routerSpy = jasmine.createSpyObj('Router', ['navigate']);
    });

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule({
            declarations: [WaitingRoomHostPageComponent, GameCountDownComponent],
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

    it('should handle sockets', () => {
        expect(hostServiceSpy.handleSockets).toHaveBeenCalled();
    });

    it('should start game', () => {
        component.startGame();
        expect(hostServiceSpy.startGame).toHaveBeenCalledWith(START_GAME_COUNTDOWN);
    });

    it('should clean up', () => {
        component.leaveLobby();
        expect(hostServiceSpy.cleanUp).toHaveBeenCalled();
        expect(routerSpy.navigate).toHaveBeenCalledWith(['/']);
    });
});
