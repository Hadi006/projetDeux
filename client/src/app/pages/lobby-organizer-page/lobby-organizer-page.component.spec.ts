import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { LobbyOrganizerPageComponent, TEST_LOBBY_DATA } from '@app/pages/lobby-organizer-page/lobby-organizer-page.component';
import { LobbyService } from '@app/services/lobby.service';
import { GameHandlerService, TEST_GAME } from '@app/services/game-handler.service';

describe('LobbyOrganizerPageComponent', () => {
    let component: LobbyOrganizerPageComponent;
    let fixture: ComponentFixture<LobbyOrganizerPageComponent>;
    let lobbyServiceSpy: jasmine.SpyObj<LobbyService>;
    let gameHandlerServiceSpy: jasmine.SpyObj<GameHandlerService>;

    beforeEach(() => {
        lobbyServiceSpy = jasmine.createSpyObj('LobbyService', ['subscribeLobbyToServer']);
        gameHandlerServiceSpy = jasmine.createSpyObj('GameHandlerService', [], {
            gameData: TEST_GAME,
        });
    });

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule({
            declarations: [LobbyOrganizerPageComponent],
            providers: [
                { provide: LobbyService, useValue: lobbyServiceSpy },
                { provide: GameHandlerService, useValue: gameHandlerServiceSpy },
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

    it('lobbyId should be set lobbyData', () => {
        expect(component.lobbyData).toEqual(TEST_LOBBY_DATA);
        expect(component.lobbyData.game).toEqual(TEST_GAME);
    });

    it('should call lobbyService.subscribeToLobbyDataById', () => {
        expect(lobbyServiceSpy.subscribeLobbyToServer).toHaveBeenCalledWith(component.lobbyData);
    });

    it('should set lobbyData.started to true', () => {
        component.startGame();
        expect(component.lobbyData.started).toBeTrue();
    });
});
