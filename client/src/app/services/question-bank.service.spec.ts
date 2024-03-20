import { HttpClientModule, HttpStatusCode } from '@angular/common/http';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { BLANK_QUESTION, TEST_QUESTIONS } from '@common/constant';
import { Question } from '@common/quiz';
import { CommunicationService } from './communication.service';
import { QuestionBankService } from './question-bank.service';

describe('QuestionBankService', () => {
    let testQuestions: Question[];

    let service: QuestionBankService;
    let httpTestingController: HttpTestingController;
    let communicationService: CommunicationService;
    let baseUrl: string;

    beforeEach(() => {
        testQuestions = JSON.parse(JSON.stringify(TEST_QUESTIONS));
    });

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [RouterTestingModule, HttpClientModule, HttpClientTestingModule],
            providers: [QuestionBankService, CommunicationService],
        });
    });

    beforeEach(() => {
        service = TestBed.inject(QuestionBankService);
        httpTestingController = TestBed.inject(HttpTestingController);
        communicationService = TestBed.inject(CommunicationService);
        baseUrl = communicationService['baseUrl'];

        service['questions'] = testQuestions;
    });

    afterEach(() => {
        httpTestingController.verify();
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should return the correct question for a valid index', () => {
        const question = service.getQuestion(0);
        expect(question).toBe(testQuestions[0]);
    });

    it('should return a default question template for an invalid index', () => {
        const outOfBoundsIndex = 999;
        const question = service.getQuestion(outOfBoundsIndex);
        expect(question).toEqual(JSON.parse(JSON.stringify(BLANK_QUESTION)));
    });

    it('should delete a question by index and send a DELETE request', () => {
        const initialQuestionsLength = service['questions'].length;
        const questionToDeleteIndex = 0;
        const questionToDeleteText = service['questions'][questionToDeleteIndex].text;

        service.deleteQuestion(questionToDeleteIndex);

        const req = httpTestingController.expectOne(`${baseUrl}/questions/${questionToDeleteText}`);
        expect(req.request.method).toBe('DELETE');
        req.flush({ status: HttpStatusCode.Ok });

        expect(service['questions'].length).toBe(initialQuestionsLength - 1);
        expect(service['questions'].find((q) => q.text === questionToDeleteText)).toBeUndefined();

        service.questions$.subscribe((questions) => {
            expect(questions.length).toBe(initialQuestionsLength - 1);
            expect(questions.find((q) => q.text === questionToDeleteText)).toBeUndefined();
        });
    });

    it('should not send a DELETE request when the question does not exist', () => {
        const initialQuestionsLength = service['questions'].length;
        const questionToDeleteIndex = 999; // Assuming 999 is out of bounds

        service.deleteQuestion(questionToDeleteIndex);

        // Verify that no HTTP request was sent
        httpTestingController.expectNone(`${baseUrl}/questions/`);

        // Verify that the questions array has not been modified
        expect(service['questions'].length).toBe(initialQuestionsLength);
    });

    it('should fetch questions from the server', () => {
        service.fetchQuestions();

        const req = httpTestingController.expectOne(`${baseUrl}/questions`);
        expect(req.request.method).toEqual('GET');
        req.flush(testQuestions);
        service.questions$.subscribe((questions) => {
            expect(questions).toEqual(testQuestions);
        });
    });

    it('should be an empty array when the server response has no body', () => {
        service.fetchQuestions();

        const req = httpTestingController.expectOne(`${baseUrl}/questions`);
        expect(req.request.method).toEqual('GET');
        req.flush(null);
        service.questions$.subscribe((questions) => {
            expect(questions).toEqual([]);
        });
    });

    it('should add a question when there is no compilation error', () => {
        const newQuestion: Question = {
            text: 'What is Angular Material?',
            type: 'QCM',
            points: 5,
            lastModification: new Date('2018-11-13T20:20:39+00:00'),
            choices: [
                { text: 'UI Component Library', isCorrect: true },
                { text: 'Framework', isCorrect: false },
            ],
        };

        service.addQuestion(newQuestion).subscribe((error) => {
            expect(error).toBe('Server error');
        });

        const req = httpTestingController.expectOne(`${baseUrl}/questions`);
        expect(req.request.method).toBe('POST');
        req.flush({ question: newQuestion, compilationError: '' });

        service.questions$.subscribe((questions) => {
            expect(questions).toContain(newQuestion);
        });
    });

    it('should not add a question when the server response has no body', () => {
        service.addQuestion(testQuestions[0]).subscribe((error) => {
            expect(error).toBe('Server error');
        });

        const req = httpTestingController.expectOne(`${baseUrl}/questions`);
        expect(req.request.method).toBe('POST');
        req.flush(null);

        service.questions$.subscribe((questions) => {
            expect(questions).not.toContain(testQuestions[0]);
        });
    });

    it('should not add a question when there is a compilation error', () => {
        service.addQuestion(testQuestions[0]).subscribe((error) => {
            expect(error).toBe('');
        });

        const req = httpTestingController.expectOne(`${baseUrl}/questions`);
        expect(req.request.method).toBe('POST');
        req.flush({ question: testQuestions[0], compilationError: 'Question already exists' });

        service.questions$.subscribe((questions) => {
            expect(questions).not.toContain(testQuestions[0]);
        });
    });

    it('should update a question when there is no compilation error', () => {
        const updatedQuestion: Question = testQuestions[0];
        updatedQuestion.text = 'updated';

        service.updateQuestion(updatedQuestion).subscribe((error) => {
            expect(error).toBe('');
        });

        const req = httpTestingController.expectOne(`${baseUrl}/questions/${updatedQuestion.text}`);
        expect(req.request.method).toBe('PATCH');
        req.flush({ question: updatedQuestion, compilationError: '' });

        service.questions$.subscribe((questions) => {
            expect(questions).toContain(updatedQuestion);
        });
    });

    it('should not update a question when there is a compilation error', () => {
        const updatedQuestion: Question = testQuestions[0];
        updatedQuestion.text = '';

        service.updateQuestion(testQuestions[0]).subscribe((error) => {
            expect(error).toBe('Server error');
        });

        const req = httpTestingController.expectOne(`${baseUrl}/questions/${testQuestions[0].text}`);
        expect(req.request.method).toBe('PATCH');
        req.flush({ question: testQuestions[0], compilationError: 'Question must have a text' });

        service.questions$.subscribe((questions) => {
            expect(questions).not.toContain(testQuestions[0]);
        });
    });

    it('should not update a question when the server response has no body', () => {
        service.updateQuestion(testQuestions[0]).subscribe((error) => {
            expect(error).toBe('Server error');
        });

        const req = httpTestingController.expectOne(`${baseUrl}/questions/${testQuestions[0].text}`);
        expect(req.request.method).toBe('PATCH');
        req.flush(null);

        service.questions$.subscribe((questions) => {
            expect(questions).not.toContain(testQuestions[0]);
        });
    });
});
