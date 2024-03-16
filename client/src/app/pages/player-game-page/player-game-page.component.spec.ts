import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PlayerGamePageComponent } from './player-game-page.component';

describe('PlayerGamePageComponent', () => {
    let component: PlayerGamePageComponent;
    let fixture: ComponentFixture<PlayerGamePageComponent>;

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [PlayerGamePageComponent],
        });
        fixture = TestBed.createComponent(PlayerGamePageComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
