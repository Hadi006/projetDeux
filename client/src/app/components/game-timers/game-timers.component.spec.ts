import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { GameStateService } from '@app/services/game-state.service';
import { GameTimersService } from '@app/services/game-timers.service';

import { GameTimersComponent } from './game-timers.component';

describe('GameTimersComponent', () => {
    let component: GameTimersComponent;
    let fixture: ComponentFixture<GameTimersComponent>;
    let gameTimersServiceSpy: jasmine.SpyObj<GameTimersService>;
    let gameStateServiceSpy: jasmine.SpyObj<GameStateService>;

    beforeEach(() => {
        gameTimersServiceSpy = jasmine.createSpyObj('GameTimersService', []);
        gameStateServiceSpy = jasmine.createSpyObj('GameStateService', []);
    });

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule({
            declarations: [GameTimersComponent],
            providers: [{ provide: GameTimersService, useValue: gameTimersServiceSpy },
                { provide: GameStateService, useValue: gameStateServiceSpy }],
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
