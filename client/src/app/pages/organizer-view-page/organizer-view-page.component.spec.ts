import { ComponentFixture, TestBed } from '@angular/core/testing';
import { OrganizerViewPageComponent } from './organizer-view-page.component';

describe('OrganizerViewPageComponent', () => {
    let component: OrganizerViewPageComponent;
    let fixture: ComponentFixture<OrganizerViewPageComponent>;

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [OrganizerViewPageComponent],
        });
        fixture = TestBed.createComponent(OrganizerViewPageComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should move player to next question', () => {
        component.currentQuestionIndex = 0; // Assuming currentQuestionIndex starts from 0
        component.movePlayerToNextQuestion();
        expect(component.currentQuestionIndex).toBe(1); // Assuming currentQuestionIndex increments by 1
    });
});
