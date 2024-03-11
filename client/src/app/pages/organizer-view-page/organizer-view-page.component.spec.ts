import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OrganizerViewPageComponent } from './organizer-view-page.component';

describe('OrganizerViewPageComponent', () => {
    let component: OrganizerViewPageComponent;
    let fixture: ComponentFixture<OrganizerViewPageComponent>;

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [OrganizerViewPageComponent],
        });
        fixture = TestBed.createComponent(OrganizerViewPageComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
