import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EndgameResultPageComponent } from './endgame-result-page.component';

describe('EndgameResultPageComponent', () => {
    let component: EndgameResultPageComponent;
    let fixture: ComponentFixture<EndgameResultPageComponent>;

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [EndgameResultPageComponent],
        });
        fixture = TestBed.createComponent(EndgameResultPageComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
