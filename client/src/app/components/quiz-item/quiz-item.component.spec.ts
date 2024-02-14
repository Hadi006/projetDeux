import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Answer, Question, Quiz } from '@common/quiz';
import { QuizItemComponent } from './quiz-item.component';

describe('QuizItemComponent', () => {
    const TEST_ANSWERS: Answer[] = [
        { text: 'Paris', isCorrect: true },
        { text: 'London', isCorrect: false },
        { text: 'Berlin', isCorrect: false },
        { text: 'Madrid', isCorrect: false },
    ];

    const TEST_QUESTIONS: Question[] = [
        {
            id: '1',
            text: 'What is the capital of France ?',
            type: 'QCM',
            points: 5,
            lastModification: new Date(),
            choices: TEST_ANSWERS,
        },
    ];

    const TEST_QUIZ: Quiz = {
        id: '1',
        title: 'Europe',
        visible: true,
        description: 'Test your knowledge of Europe',
        duration: 10,
        lastModification: new Date(),
        questions: TEST_QUESTIONS,
    };

    let component: QuizItemComponent;
    let fixture: ComponentFixture<QuizItemComponent>;

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [QuizItemComponent],
        });
        fixture = TestBed.createComponent(QuizItemComponent);
        component = fixture.componentInstance;
        component.quiz = TEST_QUIZ;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should emit an action with the quiz index', () => {
        spyOn(component.action, 'emit');
        const ACTION_TYPE = 'delete';
        component.index = 0;
        component.onAction(ACTION_TYPE);
        expect(component.action.emit).toHaveBeenCalledWith({ type: ACTION_TYPE, quizIndex: component.index });
    });
});
