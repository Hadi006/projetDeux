import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GameCountDownComponent } from './game-count-down.component';
import { TimeService } from '@app/services/time.service';

describe('GameCountDownComponent', () => {
    let component: GameCountDownComponent;
    let fixture: ComponentFixture<GameCountDownComponent>;
    let timeServiceSpy: jasmine.SpyObj<TimeService>;

    beforeEach(() => {
        timeServiceSpy = jasmine.createSpyObj('TimeService', ['createTimerById', 'getTimeById', 'startTimerById']);
    });

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [GameCountDownComponent],
            providers: [{ provide: TimeService, useValue: timeServiceSpy }],
        });
        fixture = TestBed.createComponent(GameCountDownComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
