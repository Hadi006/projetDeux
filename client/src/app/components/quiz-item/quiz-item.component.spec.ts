import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActionType } from '@common/action';
import { TEST_QUIZZES } from '@common/constant';
import { QuizItemComponent } from './quiz-item.component';

describe('QuizItemComponent', () => {
    let component: QuizItemComponent;
    let fixture: ComponentFixture<QuizItemComponent>;

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [QuizItemComponent],
        });
        fixture = TestBed.createComponent(QuizItemComponent);
        component = fixture.componentInstance;
        component.quiz = JSON.parse(JSON.stringify(TEST_QUIZZES[0]));
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should emit an action with the quiz index', () => {
        spyOn(component.action, 'emit');
        const ACTION_TYPE = ActionType.DELETE;
        component.index = 0;
        component.onAction(ACTION_TYPE);
        expect(component.action.emit).toHaveBeenCalledWith({ type: ACTION_TYPE, target: component.index });
    });
});
