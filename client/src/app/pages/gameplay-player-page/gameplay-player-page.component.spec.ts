import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GameplayPlayerPageComponent } from '@app/pages/gameplay-player-page/gameplay-player-page.component';

describe('GameplayPlayerPageComponent', () => {
    let component: GameplayPlayerPageComponent;
    let fixture: ComponentFixture<GameplayPlayerPageComponent>;

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [GameplayPlayerPageComponent],
        });
        fixture = TestBed.createComponent(GameplayPlayerPageComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
