import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { GameTimersComponent } from './game-timers.component';

describe('GameTimersComponent', () => {
    let component: GameTimersComponent;
    let fixture: ComponentFixture<GameTimersComponent>;

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule({
            declarations: [GameTimersComponent],
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(GameTimersComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
