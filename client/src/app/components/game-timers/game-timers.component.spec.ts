import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { GameTimersService } from '@app/services/game-timers.service';

import { GameTimersComponent } from './game-timers.component';

describe('GameTimersComponent', () => {
    let component: GameTimersComponent;
    let fixture: ComponentFixture<GameTimersComponent>;
    let gameTimersServiceSpy: jasmine.SpyObj<GameTimersService>;

    beforeEach(() => {
        gameTimersServiceSpy = jasmine.createSpyObj('GameTimersService', ['createQuestionTimer']);
        Object.defineProperty(gameTimersServiceSpy, 'time', { get: () => 0,
        configurable: true });
    });

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule({
            declarations: [GameTimersComponent],
            providers: [{ provide: GameTimersService, useValue: gameTimersServiceSpy }],
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
        spyOnProperty(gameTimersServiceSpy, 'time', 'get').and.returnValue(time);
        expect(component.time).toBe(time);
    });
});
