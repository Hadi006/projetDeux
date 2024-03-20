import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { Router } from '@angular/router';
import { TimeService } from '@app/services/time/time.service';
import { START_GAME_COUNTDOWN } from '@common/constant';
import { GameCountDownComponent } from './game-count-down.component';

describe('GameCountDownComponent', () => {
    const TEST_ID = 1;

    let component: GameCountDownComponent;
    let fixture: ComponentFixture<GameCountDownComponent>;
    let timeServiceSpy: jasmine.SpyObj<TimeService>;
    let routerSpy: jasmine.SpyObj<Router>;

    beforeEach(() => {
        timeServiceSpy = jasmine.createSpyObj('TimeService', ['createTimerById', 'getTimeById', 'startTimerById']);
        timeServiceSpy.createTimerById.and.returnValue(TEST_ID);
        routerSpy = jasmine.createSpyObj('Router', ['navigate']);
    });

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule({
            declarations: [GameCountDownComponent],
            providers: [
                { provide: TimeService, useValue: timeServiceSpy },
                { provide: Router, useValue: routerSpy },
            ],
        });
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(GameCountDownComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should call createTimerById on TimeService', () => {
        expect(timeServiceSpy.createTimerById).toHaveBeenCalled();
    });

    it('ngOnInit should call startTimerById', () => {
        expect(timeServiceSpy.startTimerById).toHaveBeenCalledWith(TEST_ID, START_GAME_COUNTDOWN, jasmine.any(Function));
    });

    it('time getter should call getTimeById', () => {
        const time = 10;
        timeServiceSpy.getTimeById.and.returnValue(time);
        expect(component.getTime()).toBe(timeServiceSpy.getTimeById(time));
        expect(timeServiceSpy.getTimeById).toHaveBeenCalledWith(TEST_ID);
    });

    it('should emit countdownEnded when stopCountDown is called', () => {
        const emitSpy = spyOn(component.countdownEnded, 'emit');
        component['stopCountDown']();
        expect(emitSpy).toHaveBeenCalled();
    });
});
