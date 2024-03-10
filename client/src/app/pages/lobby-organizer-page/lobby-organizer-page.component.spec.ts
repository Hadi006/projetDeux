import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { AlertComponent } from '@app/components/alert/alert.component';
import { GameCountDownComponent } from '@app/components/game-count-down/game-count-down.component';
import { LobbyOrganizerPageComponent } from '@app/pages/lobby-organizer-page/lobby-organizer-page.component';
import { HostService } from '@app/services/host.service';
import { START_GAME_COUNTDOWN, TEST_LOBBY_DATA } from '@common/constant';
import { of } from 'rxjs';

describe('LobbyOrganizerPageComponent', () => {
    let component: LobbyOrganizerPageComponent;
    let fixture: ComponentFixture<LobbyOrganizerPageComponent>;
    let hostServiceSpy: jasmine.SpyObj<HostService>;
    let routerServiceSpy: jasmine.SpyObj<Router>;
    let dialogServiceSpy: jasmine.SpyObj<MatDialog>;

    beforeEach(() => {
        hostServiceSpy = jasmine.createSpyObj('LobbyService', ['createLobby', 'cleanUp', 'startCountdown']);
        hostServiceSpy.createLobby.and.returnValue(of(true));
        Object.defineProperty(hostServiceSpy, 'lobbyData', { get: () => TEST_LOBBY_DATA, configurable: true });

        routerServiceSpy = jasmine.createSpyObj('Router', ['navigate']);
        dialogServiceSpy = jasmine.createSpyObj('MatDialog', ['open']);
    });

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule({
            declarations: [LobbyOrganizerPageComponent, GameCountDownComponent],
            providers: [
                { provide: HostService, useValue: hostServiceSpy },
                { provide: Router, useValue: routerServiceSpy },
                { provide: MatDialog, useValue: dialogServiceSpy },
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
        expect(hostServiceSpy.createLobby).toHaveBeenCalled();
    });

    it('should call leaveLobby if lobby creation returns false', () => {
        hostServiceSpy.createLobby.and.returnValue(of(false));
        component = TestBed.createComponent(LobbyOrganizerPageComponent).componentInstance;
        expect(hostServiceSpy.createLobby).toHaveBeenCalled();
        expect(routerServiceSpy.navigate).toHaveBeenCalledWith(['/']);
        expect(dialogServiceSpy.open).toHaveBeenCalledWith(AlertComponent, { data: { message: 'Maximum games reached' } });
    });

    it('should return lobbyData from lobbyService', () => {
        expect(component.lobbyData).toEqual(TEST_LOBBY_DATA);
    });

    it('should start countdown', () => {
        component.startGame();
        expect(hostServiceSpy.startCountdown).toHaveBeenCalledWith(START_GAME_COUNTDOWN);
    });

    it('should call lobbyService.cleanUp and navigate to /', () => {
        component.leaveLobby();
        expect(hostServiceSpy.cleanUp).toHaveBeenCalled();
        expect(routerServiceSpy.navigate).toHaveBeenCalledWith(['/']);
    });
});
