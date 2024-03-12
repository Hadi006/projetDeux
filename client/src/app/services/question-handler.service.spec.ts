import { TestBed } from '@angular/core/testing';
import { QuestionHandlerService } from '@app/services/question-handler.service';
import { Answer, Question } from '@common/quiz';

describe('QuestionHandlerService', () => {
    let service: QuestionHandlerService;
    let answers: Answer[];
    let QUESTIONS_DATA: Question[];

    beforeEach(() => {
        answers = [
            {
                text: '1',
                isCorrect: false,
            },
            {
                text: '2',
                isCorrect: true,
            },
            {
                text: '3',
                isCorrect: false,
            },
        ];

        QUESTIONS_DATA = [
            {
                id: '0',
                points: 10,
                text: '1+1?',
                choices: answers,
                type: 'QCM',
            },
            {
                id: '1',
                points: 10,
                text: 'What is the capital of France?',
                choices: [],
                type: 'QRL',
            },
        ];
    });

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(QuestionHandlerService);
        service.questionsData = [...QUESTIONS_DATA];
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('currentQuestion getter should return the current question', () => {
        expect(service.currentQuestion).toEqual(QUESTIONS_DATA[0]);
    });

    it('currentAnswers getter should return the correct answers', () => {
        spyOnProperty(service, 'currentQuestion', 'get').and.returnValue(QUESTIONS_DATA[0]);
        expect(service.currentAnswers).toEqual(answers.filter((answer) => answer.isCorrect));
    });

    it('currentAnswers getter should return an empty array if there is no current question', () => {
        spyOnProperty(service, 'currentQuestion', 'get').and.returnValue(undefined);
        expect(service.currentAnswers).toEqual([]);
    });

    it('questionsData setter should set the questionsData', () => {
        expect(service.currentQuestion).toEqual(QUESTIONS_DATA[0]);
    });

    it('questionsData setter should reset the currentQuestionIndex', () => {
        service.currentQuestionIndex = 1;
        service.questionsData = [...QUESTIONS_DATA];
        expect(service.currentQuestion).toEqual(QUESTIONS_DATA[0]);
    });

    it('nextQuestion should load the next question', () => {
        service.currentQuestionIndex = 0;
        expect(service.currentQuestion).toEqual(QUESTIONS_DATA[1]);
    });
});
