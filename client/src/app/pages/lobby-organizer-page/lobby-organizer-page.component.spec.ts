import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LobbyOrganizerPageComponent } from '@app/pages/lobby-organizer-page/lobby-organizer-page.component';
import { ActivatedRoute } from '@angular/router';
import { LobbyService } from '@app/services/lobby.service';

describe('LobbyOrganizerPageComponent', () => {
    let component: LobbyOrganizerPageComponent;
    let fixture: ComponentFixture<LobbyOrganizerPageComponent>;

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [LobbyOrganizerPageComponent],
        });
        fixture = TestBed.createComponent(LobbyOrganizerPageComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
