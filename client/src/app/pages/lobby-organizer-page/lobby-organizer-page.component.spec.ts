import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LobbyOrganizerPageComponent } from './lobby-organizer-page.component';

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
