import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { ScoreComponent } from './score.component';

describe('ScoreComponent', () => {
    const TEST_PLAYER = { score: 0, answer: [false, true, false, false], answerConfirmed: false };

    let component: ScoreComponent;
    let fixture: ComponentFixture<ScoreComponent>;

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule({
            declarations: [ScoreComponent],
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(ScoreComponent);
        component = fixture.componentInstance;
        component.player = TEST_PLAYER;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
