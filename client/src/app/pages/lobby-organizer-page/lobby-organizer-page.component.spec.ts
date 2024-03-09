import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { Router } from '@angular/router';
import { GameCountDownComponent } from '@app/components/game-count-down/game-count-down.component';
import { LobbyOrganizerPageComponent } from '@app/pages/lobby-organizer-page/lobby-organizer-page.component';
import { LobbyService } from '@app/services/lobby.service';
import { TEST_LOBBY_DATA } from '@common/constant';

describe('LobbyOrganizerPageComponent', () => {
    let component: LobbyOrganizerPageComponent;
    let fixture: ComponentFixture<LobbyOrganizerPageComponent>;
    let lobbyServiceSpy: jasmine.SpyObj<LobbyService>;
    let routerServiceSpy: jasmine.SpyObj<Router>;

    beforeEach(() => {
        lobbyServiceSpy = jasmine.createSpyObj('LobbyService', ['createLobby', 'cleanUp']);
        Object.defineProperty(lobbyServiceSpy, 'lobbyData', { get: () => TEST_LOBBY_DATA, configurable: true });

        routerServiceSpy = jasmine.createSpyObj('Router', ['navigate']);
    });

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule({
            declarations: [LobbyOrganizerPageComponent, GameCountDownComponent],
            providers: [
                { provide: LobbyService, useValue: lobbyServiceSpy },
                { provide: Router, useValue: routerServiceSpy },
            ],
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

    it('should call lobbyService.createLobby', () => {
        expect(lobbyServiceSpy.createLobby).toHaveBeenCalled();
    });

    it('should call leaveLobby if lobbyData is undefined', () => {
        Object.defineProperty(lobbyServiceSpy, 'lobbyData', { get: () => undefined, configurable: true });
        component = TestBed.createComponent(LobbyOrganizerPageComponent).componentInstance;
        expect(lobbyServiceSpy.createLobby).toHaveBeenCalled();
        expect(routerServiceSpy.navigate).toHaveBeenCalledWith(['/']);
    });

    it('should return lobbyData from lobbyService', () => {
        expect(component.lobbyData).toEqual(TEST_LOBBY_DATA);
    });

    it('should set lobbyData.started to true', () => {
        component.startGame();
        expect(component.lobbyData.started).toBeTrue();
    });

    it('should call lobbyService.cleanUp and navigate to /', () => {
        component.leaveLobby();
        expect(lobbyServiceSpy.cleanUp).toHaveBeenCalled();
        expect(routerServiceSpy.navigate).toHaveBeenCalledWith(['/']);
    });
});
