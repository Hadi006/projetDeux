import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { LobbyOrganizerPageComponent } from '@app/pages/lobby-organizer-page/lobby-organizer-page.component';
import { ActivatedRoute } from '@angular/router';
import { LobbyService } from '@app/services/lobby.service';

describe('LobbyOrganizerPageComponent', () => {
    let component: LobbyOrganizerPageComponent;
    let fixture: ComponentFixture<LobbyOrganizerPageComponent>;
    let activatedRouteSpy: jasmine.SpyObj<ActivatedRoute>;
    let lobbyServiceSpy: jasmine.SpyObj<LobbyService>;

    beforeEach(() => {
        activatedRouteSpy = jasmine.createSpyObj('ActivatedRoute', ['snapshot']);
        activatedRouteSpy.snapshot.params = { id: 1 };
        lobbyServiceSpy = jasmine.createSpyObj('LobbyService', ['subscribeToLobbyDataById']);
    });

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule({
            declarations: [LobbyOrganizerPageComponent],
            providers: [
                { provide: ActivatedRoute, useValue: activatedRouteSpy },
                { provide: LobbyService, useValue: lobbyServiceSpy },
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

    it('lobbyId should be set from route', () => {
        expect(component.lobbyId).toBe(activatedRouteSpy.snapshot.params.id);
    });

    it('should call lobbyService.subscribeToLobbyDataById', () => {
        expect(lobbyServiceSpy.subscribeToLobbyDataById).toHaveBeenCalledWith(component.lobbyId, component.lobbyData);
    });
});
