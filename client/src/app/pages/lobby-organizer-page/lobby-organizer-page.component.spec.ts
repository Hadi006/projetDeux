import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { LobbyOrganizerPageComponent, TEST_LOBBY_DATA } from '@app/pages/lobby-organizer-page/lobby-organizer-page.component';
import { LobbyService } from '@app/services/lobby.service';

describe('LobbyOrganizerPageComponent', () => {
    let component: LobbyOrganizerPageComponent;
    let fixture: ComponentFixture<LobbyOrganizerPageComponent>;
    let lobbyServiceSpy: jasmine.SpyObj<LobbyService>;

    beforeEach(() => {
        lobbyServiceSpy = jasmine.createSpyObj('LobbyService', ['subscribeLobbyToServer']);
    });

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule({
            declarations: [LobbyOrganizerPageComponent],
            providers: [{ provide: LobbyService, useValue: lobbyServiceSpy }],
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
    });

    it('should call lobbyService.subscribeToLobbyDataById', () => {
        expect(lobbyServiceSpy.subscribeLobbyToServer).toHaveBeenCalledWith(component.lobbyData);
    });
});
