import { TestBed } from '@angular/core/testing';

import { HttpResponse } from '@angular/common/http';
import { MatDialog } from '@angular/material/dialog';
import { AlertComponent } from '@app/components/alert/alert.component';
import { N_RANDOM_QUESTIONS, TEST_QUIZZES } from '@common/constant';
import { Quiz } from '@common/quiz';
import { of } from 'rxjs';
import { CommunicationService } from '@app/services/communication/communication.service';
import { PublicQuizzesService } from './public-quizzes.service';

describe('PublicQuizzesService', () => {
    let testQuizzes: Quiz[];

    let service: PublicQuizzesService;
    let communicationServiceSpy: jasmine.SpyObj<CommunicationService>;
    let dialogSpy: jasmine.SpyObj<MatDialog>;

    beforeEach(() => {
        testQuizzes = JSON.parse(JSON.stringify(TEST_QUIZZES));

        communicationServiceSpy = jasmine.createSpyObj('CommunicationService', ['get']);
        dialogSpy = jasmine.createSpyObj('MatDialog', ['open']);
    });

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [
                { provide: CommunicationService, useValue: communicationServiceSpy },
                {
                    provide: MatDialog,
                    useValue: dialogSpy,
                },
            ],
        });
        service = TestBed.inject(PublicQuizzesService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('fetchVisibleQuizzes() should make GET request and update list', (done) => {
        communicationServiceSpy.get.and.returnValue(of(new HttpResponse({ status: 200, statusText: 'OK', body: testQuizzes })));
        service.fetchVisibleQuizzes().subscribe(() => {
            expect(service.quizzes).toEqual(testQuizzes);
            done();
        });
    });

    it('fetchVisibleQuizzes() should do nothing if HTTP request fails', (done) => {
        communicationServiceSpy.get.and.returnValue(of(new HttpResponse({ status: 500, statusText: 'Server Error' })));
        service.fetchVisibleQuizzes().subscribe(() => {
            expect(service.quizzes).toEqual([]);
            done();
        });
    });

    it('fetchVisibleQuizzes() should do nothing if response body is undefined', (done) => {
        communicationServiceSpy.get.and.returnValue(of(new HttpResponse({ status: 200, statusText: 'OK' })));
        service.fetchVisibleQuizzes().subscribe(() => {
            expect(service.quizzes).toEqual([]);
            done();
        });
    });

    it('checkQuizAvailability() should return true if quiz is available', (done) => {
        communicationServiceSpy.get.and.returnValue(of(new HttpResponse({ status: 200, statusText: 'OK', body: { ...testQuizzes[0] } })));
        service.checkQuizAvailability(testQuizzes[0].id).subscribe((isAvailable) => {
            expect(isAvailable).toBeTrue();
            done();
        });
    });

    it('checkQuizAvailability() should return false if quiz is not available', (done) => {
        communicationServiceSpy.get.and.returnValue(of(new HttpResponse({ status: 200, statusText: 'OK' })));
        service.checkQuizAvailability(testQuizzes[0].id).subscribe((isAvailable) => {
            expect(isAvailable).toBeFalse();
            done();
        });
    });

    it('checkQuizAvailability() should return false if quiz id is undefined', (done) => {
        service.checkQuizAvailability().subscribe((isAvailable) => {
            expect(isAvailable).toBeFalse();
            done();
        });
    });

    it('alertNoQuizAvailable() should open a dialog', () => {
        service.alertNoQuizAvailable('test');
        expect(dialogSpy.open).toHaveBeenCalledWith(AlertComponent, {
            data: {
                title: 'Erreur',
                message: 'test',
            },
        });
    });

    it('should create random questions', (done) => {
        communicationServiceSpy.get.and.returnValue(
            of(new HttpResponse({ status: 200, statusText: 'OK', body: new Array(N_RANDOM_QUESTIONS).fill(testQuizzes[0].questions) })),
        );
        service.createRandomQuestions().subscribe((questions) => {
            expect(questions.length).toBeGreaterThan(0);
            done();
        });
    });

    it('should return empty array if response is not ok', (done) => {
        communicationServiceSpy.get.and.returnValue(of(new HttpResponse({ status: 400, statusText: 'OK', body: [] })));
        service.createRandomQuestions().subscribe((questions) => {
            expect(questions).toEqual([]);
            done();
        });
    });

    it('should return empty array if there are not enough questions', (done) => {
        communicationServiceSpy.get.and.returnValue(of(new HttpResponse({ status: 200, statusText: 'OK', body: [] })));
        service.createRandomQuestions().subscribe((questions) => {
            expect(questions).toEqual([]);
            done();
        });
    });
});
