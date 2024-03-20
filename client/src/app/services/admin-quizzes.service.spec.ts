import { HttpResponse } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { TEST_QUIZZES } from '@common/constant';
import { Quiz } from '@common/quiz';
import { of } from 'rxjs';
import { AdminQuizzesService } from './admin-quizzes.service';
import { CommunicationService } from './communication.service';

describe('AdminQuizzesService', () => {
    let testQuizzes: Quiz[];
    let testQuiz: Quiz;

    let service: AdminQuizzesService;
    let communicationServiceSpy: jasmine.SpyObj<CommunicationService>;
    let baseUrl: string;

    beforeEach(() => {
        testQuizzes = JSON.parse(JSON.stringify(TEST_QUIZZES));
        testQuiz = JSON.parse(JSON.stringify(TEST_QUIZZES[1]));

        baseUrl = 'http://localhost:3000';
        communicationServiceSpy = jasmine.createSpyObj('CommunicationService', ['post', 'get', 'patch', 'download', 'delete'], {
            baseUrl,
        });
        TestBed.configureTestingModule({
            imports: [RouterTestingModule],
            providers: [
                {
                    provide: CommunicationService,
                    useValue: communicationServiceSpy,
                },
                AdminQuizzesService,
            ],
        });
        service = TestBed.inject(AdminQuizzesService);
        service['quizzes'] = [testQuizzes[0]];
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('fetchQuizzes() should make GET request and update quizzes', () => {
        communicationServiceSpy.get.and.returnValue(of(new HttpResponse({ status: 200, statusText: 'OK', body: testQuizzes })));
        service.fetchQuizzes();
        service.quizzes$.subscribe((quizzes) => {
            expect(quizzes).toEqual(testQuizzes);
        });
    });

    it('fetchQuizzes() should handle error if HTTP request fails', () => {
        communicationServiceSpy.get.and.returnValue(of(new HttpResponse({ status: 500, statusText: 'Server Error' })));
        service.fetchQuizzes();
        service.quizzes$.subscribe((quizzes) => {
            expect(quizzes).toEqual([]);
        });
    });

    it('uploadQuiz should read a quiz file and validate the uploaded quiz', (done) => {
        const quizJson = JSON.stringify(testQuizzes[0]);
        const mockQuizFile = new File([quizJson], 'quiz.txt', {
            type: 'text/plain',
        });
        communicationServiceSpy.post.and.returnValue(
            of(
                new HttpResponse({
                    status: 200,
                    statusText: 'OK',
                    body: { data: { ...testQuizzes[0] }, error: '' },
                }),
            ),
        );
        spyOn(service, 'submitQuiz').and.returnValue(of({ data: testQuizzes[0], error: '' }));
        service.uploadQuiz(mockQuizFile).subscribe({
            next: (response) => {
                expect(response.data).toEqual(testQuizzes[0]);
                expect(response.error).toBe('');
                done();
            },
            error: done.fail,
        });
    });

    it('should handle an empty or invalid quiz file gracefully', (done) => {
        const mockQuizFile = new File([''], 'quiz.txt', { type: 'text/plain' });
        service.uploadQuiz(mockQuizFile).subscribe({
            next: (response) => {
                expect(response.error).toBe('Error occurred while uploading quiz');
                done();
            },
            error: () => {
                done.fail();
            },
        });
    });

    it('should handle file reading error gracefully', (done) => {
        const mockQuizFile = new File([''], 'quiz.txt', { type: 'text/plain' });
        spyOn(window, 'FileReader').and.throwError('File reading error');
        service.uploadQuiz(mockQuizFile).subscribe({
            next: (response) => {
                expect(response.error).toBe('Error occurred while uploading quiz');
                done();
            },
            error: () => {
                done.fail();
            },
        });
    });

    it('should toggle quiz visibility', () => {
        const QUIZ = service['quizzes'][0];
        const initialVisibility = QUIZ.visible;
        communicationServiceSpy.patch.and.returnValue(of(new HttpResponse({ status: 200, statusText: 'OK' })));
        service.changeQuizVisibility(0);
        expect(QUIZ.visible).toBe(!initialVisibility);
    });

    it('should do nothing if visibility change fails', () => {
        service.changeQuizVisibility(1);
        expect(communicationServiceSpy.patch).not.toHaveBeenCalled();
    });

    it('should trigger a download for a quiz', () => {
        const mockBlob = new Blob(['dummy content'], { type: 'application/json' });
        const mockURL = 'blob:testUrl';
        spyOn(window.URL, 'createObjectURL').and.returnValue(mockURL);
        const clickSpy = spyOn(HTMLElement.prototype, 'click').and.stub();
        communicationServiceSpy.download.and.returnValue(of(mockBlob));
        service.downloadQuiz(0);
        expect(clickSpy).toHaveBeenCalled();
    });

    it('should do nothing if download fails', () => {
        service.downloadQuiz(1);
        expect(communicationServiceSpy.download).not.toHaveBeenCalled();
    });

    it('should delete a quiz and send a DELETE request', () => {
        const quizToDeleteId = testQuizzes[0].id;
        const initialQuizzesLength = service['quizzes'].length;
        communicationServiceSpy.delete.and.returnValue(of(new HttpResponse({ status: 200, statusText: 'OK' })));
        service.deleteQuiz(0);
        expect(service['quizzes'].length).toBe(initialQuizzesLength - 1);
        expect(service['quizzes'].find((quiz) => quiz.id === quizToDeleteId)).toBeUndefined();
    });

    it('should do nothing if delete fails', () => {
        service.deleteQuiz(1);
        expect(communicationServiceSpy.delete).not.toHaveBeenCalled();
    });

    it('should return an existing quiz for a valid index', () => {
        service.setSelectedQuiz(0);
        const quiz = service.getSelectedQuiz();
        expect(quiz).toEqual(testQuizzes[0]);
    });

    it('should return a new quiz template for an invalid index', () => {
        const invalidIndex = -1;
        service.setSelectedQuiz(invalidIndex);
        const quiz = service.getSelectedQuiz();
        expect(quiz).toBeTruthy();
        expect(quiz.id).toBe('');
        expect(quiz.title).toBe('');
        expect(quiz.visible).toBe(false);
    });

    it('should submit a quiz and update quizzes list if successful', () => {
        const responseBodyMock = {
            data: testQuiz,
            error: '',
        };
        communicationServiceSpy.post.and.returnValue(of(new HttpResponse({ status: 200, statusText: 'OK', body: responseBodyMock })));
        service.submitQuiz(testQuiz).subscribe({
            next: (result) => {
                expect(result.data).toEqual(testQuiz);
                expect(service['quizzes']).toContain(testQuiz);
            },
        });
    });

    it('should not update quizzes list if submission fails', () => {
        const responseBodyMock = {
            data: undefined,
            error: 'submission failed',
        };
        communicationServiceSpy.post.and.returnValue(of(new HttpResponse({ status: 200, statusText: 'OK', body: responseBodyMock })));
        service.submitQuiz(testQuiz).subscribe({
            next: (result) => {
                expect(result.error).toBe('submission failed');
                expect(result.data).toBeUndefined();
                expect(service['quizzes']).not.toContain(testQuiz);
            },
        });
    });

    it('should not update quizzes if title is not unique', () => {
        const responseBodyMock = {
            data: { title: testQuizzes[0].title },
            error: '',
        };
        service['quizzes'].push(testQuizzes[0]);
        communicationServiceSpy.post.and.returnValue(of(new HttpResponse({ status: 200, statusText: 'OK', body: responseBodyMock })));
        service.submitQuiz(testQuiz).subscribe({
            next: (result) => {
                expect(result.error).toBe('titre déjà utilisé');
                expect(result.data?.title).toEqual(testQuizzes[0].title);
                expect(service['quizzes']).not.toContain(testQuiz);
            },
        });
    });

    it('should return error if submission returns an error', () => {
        const responseBodyMock = {
            data: testQuiz,
            error: 'submission failed',
        };
        communicationServiceSpy.post.and.returnValue(of(new HttpResponse({ status: 500, statusText: 'Server Error', body: responseBodyMock })));
        service.submitQuiz(testQuiz).subscribe({
            next: (result) => {
                expect(result.error).toBe('submission failed');
                expect(result.data).toEqual(testQuiz);
                expect(service['quizzes']).not.toContain(testQuiz);
            },
        });
    });

    it('should update a quiz and update quizzes list if successful', () => {
        const responseBodyMock = {
            data: testQuizzes[0],
            error: '',
        };
        communicationServiceSpy.patch.and.returnValue(of(new HttpResponse({ status: 200, statusText: 'OK', body: responseBodyMock })));
        service.updateQuiz(testQuizzes[0]).subscribe({
            next: (result) => {
                expect(result.data).toEqual(testQuizzes[0]);
                expect(service['quizzes']).toContain(testQuizzes[0]);
            },
        });
    });

    it('should return error when update response has no body', () => {
        communicationServiceSpy.patch.and.returnValue(of(new HttpResponse({ status: 500, statusText: 'Server Error' })));
        service.updateQuiz({ ...testQuizzes[0] }).subscribe({
            next: (response) => {
                expect(response.data).toBeUndefined();
                expect(response.error).toBe('update failed');
            },
        });
    });

    it('should not update quizzes list if update fails', () => {
        const responseBodyMock = {
            data: undefined,
            error: 'update failed',
        };
        communicationServiceSpy.patch.and.returnValue(of(new HttpResponse({ status: 200, statusText: 'OK', body: responseBodyMock })));
        service.updateQuiz(testQuiz).subscribe({
            next: (result) => {
                expect(result.error).toBe('update failed');
                expect(result.data).toBeUndefined();
                expect(service['quizzes']).not.toContain(testQuiz);
            },
        });
    });

    it('should return "Server error" when response has no body', () => {
        communicationServiceSpy.post.and.returnValue(of(new HttpResponse({ status: 500, statusText: 'Server Error' })));
        service.submitQuestion({ ...testQuizzes[0].questions[0] }).subscribe((error) => {
            expect(error).toBe('Server error');
        });
    });

    it('should return a compilation error when response has compilationError', (done) => {
        const compilationError = 'Compilation error: Incorrect syntax.';
        communicationServiceSpy.post.and.returnValue(of(new HttpResponse({ status: 200, statusText: 'OK', body: { error: compilationError } })));
        service.submitQuestion({ ...testQuizzes[0].questions[0] }).subscribe((result) => {
            expect(result).toBe(compilationError);
            done();
        });
    });

    it('should return an empty string when question is successfully validated', () => {
        communicationServiceSpy.post.and.returnValue(of(new HttpResponse({ status: 200, statusText: 'OK', body: {} })));
        service.submitQuestion({ ...testQuizzes[0].questions[0] }).subscribe((result) => {
            expect(result).toBe('');
        });
    });
});
