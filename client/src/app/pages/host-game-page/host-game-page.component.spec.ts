import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { HostService } from '@app/services/host.service';
import { TEST_GAME_DATA } from '@common/constant';

import { HostGamePageComponent } from './host-game-page.component';

describe('HostGamePageComponent', () => {
    let component: HostGamePageComponent;
    let fixture: ComponentFixture<HostGamePageComponent>;
    let hostServiceSpy: jasmine.SpyObj<HostService>;

    beforeEach(() => {
        hostServiceSpy = jasmine.createSpyObj('HostService', ['getCurrentQuestion', 'getTime', 'questionEnded', 'nextQuestion', 'getGame']);
        Object.defineProperty(hostServiceSpy, 'game', {
            get: () => {
                return TEST_GAME_DATA;
            },
            configurable: true,
        });
    });

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule({
            declarations: [HostGamePageComponent],
            providers: [{ provide: HostService, useValue: hostServiceSpy }],
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(HostGamePageComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('stopCountDown should set isCountingDown to false', () => {
        component.stopCountDown();
        expect(component.isCountingDown).toBeFalse();
    });
});
