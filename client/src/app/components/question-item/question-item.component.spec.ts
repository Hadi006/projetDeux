import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { MatIcon, MatIconModule } from '@angular/material/icon';
import { ActivatedRoute } from '@angular/router';
import { QuestionItemComponent } from '@app/components/question-item/question-item.component';
import { Answer, Question } from '@common/quiz';

describe('QuestionItemComponent', () => {
    const TEST_ANSWERS: Answer[] = [
        { text: 'Paris', isCorrect: true },
        { text: 'London', isCorrect: false },
        { text: 'Berlin', isCorrect: false },
        { text: 'Madrid', isCorrect: false },
    ];

    const TEST_QUESTION: Question = {
        id: '1',
        text: 'What is the capital of France ?',
        type: 'single',
        points: 5,
        lastModification: new Date(),
        choices: TEST_ANSWERS,
    };

    let component: QuestionItemComponent;
    let fixture: ComponentFixture<QuestionItemComponent>;
    let activatedRouteSpy: jasmine.SpyObj<ActivatedRoute>;

    beforeEach(() => {
        activatedRouteSpy = jasmine.createSpyObj('ActivatedRoute', ['snapshot'], { snapshot: { url: ['home', 'admin', 'quizzes'] } });
    });

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule({
            declarations: [QuestionItemComponent, MatIcon],
            imports: [MatIconModule],
            providers: [{ provide: ActivatedRoute, useValue: activatedRouteSpy }],
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(QuestionItemComponent);
        component = fixture.componentInstance;
        component.question = TEST_QUESTION;
        component.index = 0;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should emit an action with the index', () => {
        spyOn(component.action, 'emit');
        const ACTION_TYPE = 'delete';
        component.onAction(ACTION_TYPE);
        expect(component.action.emit).toHaveBeenCalledWith({ type: ACTION_TYPE, questionIndex: component.index });
    });
});
