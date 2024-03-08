import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { GameManagementService } from '@app/services/game-management.service';
import { GameTimersComponent } from './game-timers.component';

describe('GameTimersComponent', () => {
    let component: GameTimersComponent;
    let fixture: ComponentFixture<GameTimersComponent>;
    let gameManagementServiceSpy: jasmine.SpyObj<GameManagementService>;

    beforeEach(() => {
        gameManagementServiceSpy = jasmine.createSpyObj('GameTimersService', ['startQuestionTimer', 'resetTimers']);
        Object.defineProperty(gameManagementServiceSpy, 'time', { get: () => 0, configurable: true });
    });

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule({
            declarations: [GameTimersComponent],
            providers: [{ provide: GameManagementService, useValue: gameManagementServiceSpy }],
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

    it('should get time from service', () => {
        const time = 10;
        spyOnProperty(gameManagementServiceSpy, 'time', 'get').and.returnValue(time);
        expect(component.time).toBe(time);
    });

    it('should reset timers on destroy', () => {
        component.ngOnDestroy();
        expect(gameManagementServiceSpy.resetTimers).toHaveBeenCalled();
    });
});
