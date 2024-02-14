import { HttpClientModule, HttpStatusCode } from '@angular/common/http';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { Question } from '@common/quiz';
import { CommunicationService } from './communication.service';
import { QuestionBankService } from './question-bank.service';

describe('QuestionBankService', () => {
    let service: QuestionBankService;
    let httpTestingController: HttpTestingController;
    let questionListTest: Question[];
    let communicationService: CommunicationService;
    let baseUrl: string;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [RouterTestingModule, HttpClientModule, HttpClientTestingModule],
            providers: [QuestionBankService, CommunicationService],
        });
        service = TestBed.inject(QuestionBankService);
        httpTestingController = TestBed.inject(HttpTestingController);
        communicationService = TestBed.inject(CommunicationService);
        baseUrl = communicationService['baseUrl'];

        questionListTest = [
            {
                id: '1',
                text: 'What is Angular?',
                type: 'QCM',
                points: 5,
                lastModification: new Date('2018-11-13T20:20:39+00:00'),
                choices: [
                    { text: 'Framework', isCorrect: true },
                    { text: 'Library', isCorrect: false },
                ],
            },
            {
                id: '2',
                text: 'What is TypeScript?',
                type: 'QCM',
                points: 5,
                lastModification: new Date('2018-11-13T20:20:39+00:00'),
                choices: [
                    { text: 'Programming Language', isCorrect: true },
                    { text: 'Compiler', isCorrect: false },
                ],
            },
            {
                id: '',
                text: '',
                type: 'QCM',
                points: 0,
                choices: [
                    { text: '', isCorrect: false },
                    { text: '', isCorrect: false },
                ],
            },
        ];

        service['questions'] = questionListTest;
    });

    afterEach(() => {
        httpTestingController.verify();
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should return the correct question for a valid index', () => {
        const question = service.getQuestion(0);
        expect(question).toBe(questionListTest[0]);
    });

    it('should return a default question template for an invalid index', () => {
        const outOfBoundsIndex = 999;
        const question = service.getQuestion(outOfBoundsIndex);
        expect(question).toEqual(questionListTest[2]);
    });

    it('should delete a question by index and send a DELETE request', () => {
        const initialQuestionsLength = service['questions'].length;
        const questionToDeleteIndex = 0;
        const questionToDeleteId = service['questions'][questionToDeleteIndex].id;

        service.deleteQuestion(questionToDeleteIndex);

        // Verify the DELETE HTTP request
        const req = httpTestingController.expectOne(`${baseUrl}/questions/${questionToDeleteId}`);
        expect(req.request.method).toBe('DELETE');
        req.flush({ status: HttpStatusCode.Ok });

        // Verify the question was removed from the array
        expect(service['questions'].length).toBe(initialQuestionsLength - 1);
        expect(service['questions'].find((q) => q.id === questionToDeleteId)).toBeUndefined();

        // Additionally, verify that the questions$ BehaviorSubject has been updated
        service.questions$.subscribe((questions) => {
            expect(questions.length).toBe(initialQuestionsLength - 1);
            expect(questions.find((q) => q.id === questionToDeleteId)).toBeUndefined();
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
        req.flush(questionListTest);
        service.questions$.subscribe((questions) => {
            expect(questions).toEqual(questionListTest);
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
            id: '',
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
            expect(error).toBe('');
        });

        const req = httpTestingController.expectOne(`${baseUrl}/questions`);
        expect(req.request.method).toBe('POST');
        req.flush({ question: newQuestion, compilationError: '' });

        service.questions$.subscribe((questions) => {
            expect(questions).toContain(newQuestion);
        });
    });

    it('should not add a question when the server response has no body', () => {
        service.addQuestion(questionListTest[0]).subscribe((error) => {
            expect(error).toBe('Server error');
        });

        const req = httpTestingController.expectOne(`${baseUrl}/questions`);
        expect(req.request.method).toBe('POST');
        req.flush(null);

        service.questions$.subscribe((questions) => {
            expect(questions).not.toContain(questionListTest[0]);
        });
    });

    it('should not add a question when there is a compilation error', () => {
        service.addQuestion(questionListTest[0]).subscribe((error) => {
            expect(error).toBe('Question already exists');
        });

        const req = httpTestingController.expectOne(`${baseUrl}/questions`);
        expect(req.request.method).toBe('POST');
        req.flush({ question: questionListTest[0], compilationError: 'Question already exists' });

        service.questions$.subscribe((questions) => {
            expect(questions).not.toContain(questionListTest[0]);
        });
    });

    it('should update a question when there is no compilation error', () => {
        const updatedQuestion: Question = questionListTest[0];
        updatedQuestion.text = 'updated';

        service.updateQuestion(updatedQuestion).subscribe((error) => {
            expect(error).toBe('');
        });

        const req = httpTestingController.expectOne(`${baseUrl}/questions/${updatedQuestion.id}`);
        expect(req.request.method).toBe('PATCH');
        req.flush({ question: updatedQuestion, compilationError: '' });

        service.questions$.subscribe((questions) => {
            expect(questions).toContain(updatedQuestion);
        });
    });

    it('should not update a question when there is a compilation error', () => {
        const updatedQuestion: Question = questionListTest[0];
        updatedQuestion.text = '';

        service.updateQuestion(questionListTest[0]).subscribe((error) => {
            expect(error).toBe('Question must have a text');
        });

        const req = httpTestingController.expectOne(`${baseUrl}/questions/${questionListTest[0].id}`);
        expect(req.request.method).toBe('PATCH');
        req.flush({ question: questionListTest[0], compilationError: 'Question must have a text' });

        service.questions$.subscribe((questions) => {
            expect(questions).not.toContain(questionListTest[0]);
        });
    });

    it('should not update a question when the server response has no body', () => {
        service.updateQuestion(questionListTest[0]).subscribe((error) => {
            expect(error).toBe('Server error');
        });

        const req = httpTestingController.expectOne(`${baseUrl}/questions/${questionListTest[0].id}`);
        expect(req.request.method).toBe('PATCH');
        req.flush(null);

        service.questions$.subscribe((questions) => {
            expect(questions).not.toContain(questionListTest[0]);
        });
    });
});
