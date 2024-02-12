import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TimeService } from '@app/services/time.service';
import { COUNTDOWN_TIME } from '@common/constant';
import { GameCountDownComponent } from './game-count-down.component';

describe('GameCountDownComponent', () => {
    const TEST_ID = 1;

    let component: GameCountDownComponent;
    let fixture: ComponentFixture<GameCountDownComponent>;
    let timeServiceSpy: jasmine.SpyObj<TimeService>;

    beforeEach(() => {
        timeServiceSpy = jasmine.createSpyObj('TimeService', ['createTimerById', 'getTimeById', 'startTimerById']);
        timeServiceSpy.createTimerById.and.returnValue(TEST_ID);
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

    it('should call createTimerById on TimeService', () => {
        expect(timeServiceSpy.createTimerById).toHaveBeenCalled();
    });

    it('ngOnInit should call startTimerById', () => {
        expect(timeServiceSpy.startTimerById).toHaveBeenCalledWith(TEST_ID, COUNTDOWN_TIME);
    });

    it('time getter should call getTimeById', () => {
        const time = 10;
        timeServiceSpy.getTimeById.and.returnValue(time);
        expect(component.time).toBe(timeServiceSpy.getTimeById(time));
        expect(timeServiceSpy.getTimeById).toHaveBeenCalledWith(TEST_ID);
    });
});
