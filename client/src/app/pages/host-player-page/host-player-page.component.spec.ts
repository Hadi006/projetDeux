import { ComponentFixture, TestBed } from '@angular/core/testing';
import { QuestionComponent } from '@app/components/question/question.component';

import { HostPlayerPageComponent } from './host-player-page.component';

describe('HostPlayerPageComponent', () => {
    let component: HostPlayerPageComponent;
    let fixture: ComponentFixture<HostPlayerPageComponent>;

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [HostPlayerPageComponent, QuestionComponent],
        });
        fixture = TestBed.createComponent(HostPlayerPageComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
