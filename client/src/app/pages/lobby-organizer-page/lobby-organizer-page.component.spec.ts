import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { GameCountDownComponent } from '@app/components/game-count-down/game-count-down.component';
import { LobbyOrganizerPageComponent } from '@app/pages/lobby-organizer-page/lobby-organizer-page.component';
import { HostService } from '@app/services/host.service';
import { START_GAME_COUNTDOWN, TEST_LOBBY_DATA } from '@common/constant';

describe('LobbyOrganizerPageComponent', () => {
    let component: LobbyOrganizerPageComponent;
    let fixture: ComponentFixture<LobbyOrganizerPageComponent>;
    let hostServiceSpy: jasmine.SpyObj<HostService>;

    beforeEach(() => {
        hostServiceSpy = jasmine.createSpyObj('LobbyService', ['cleanUp', 'startGame', 'handleSockets']);
        Object.defineProperty(hostServiceSpy, 'lobbyData', { get: () => TEST_LOBBY_DATA, configurable: true });
    });

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule({
            declarations: [LobbyOrganizerPageComponent, GameCountDownComponent],
            providers: [{ provide: HostService, useValue: hostServiceSpy }],
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(LobbyOrganizerPageComponent);
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
    });
});
