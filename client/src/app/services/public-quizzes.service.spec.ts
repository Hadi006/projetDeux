import { TestBed } from '@angular/core/testing';

import { PublicQuizzesService } from './public-quizzes.service';
import { CommunicationService } from './communication.service';
import { Quiz } from '@common/quiz';
import { of } from 'rxjs';
import { HttpResponse } from '@angular/common/http';
import { MatDialog } from '@angular/material/dialog';

describe('PublicQuizzesService', () => {
    let service: PublicQuizzesService;
    let quizListTest: Quiz[];
    let communicationServiceSpy: jasmine.SpyObj<CommunicationService>;
    let dialogSpy: jasmine.SpyObj<MatDialog>;

    beforeEach(() => {
        communicationServiceSpy = jasmine.createSpyObj('CommunicationService', ['get']);
    });

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [{ provide: CommunicationService, useValue: communicationServiceSpy }, {
                provide: MatDialog,
                useValue: jasmine.createSpyObj('MatDialog', ['open']),
            }],
        });
        service = TestBed.inject(PublicQuizzesService);
        quizListTest = [
            {
                id: '1',
                title: 'Questionnaire sur le JS',
                duration: 60,
                description: 'Un questionnaire sur vos connaissances en Javascript',
                visible: true,
                lastModification: new Date('2018-11-13T20:20:39+00:00'),
                questions: [
                    {
                        id: '20',
                        type: 'QCM',
                        text: "Est-ce qu'on le code suivant lance une erreur : const a = 1/NaN; ? ",
                        points: 20,
                        lastModification: new Date('2018-11-13T20:20:39+00:00'),
                        choices: [
                            {
                                text: 'Non',
                                isCorrect: true,
                            },
                            {
                                text: 'Oui',
                                isCorrect: false,
                            },
                        ],
                    },
                ],
            },
        ];
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('fetchVisibleQuizzes() should make GET request and update list', () => {
        communicationServiceSpy.get.and.returnValue(of(new HttpResponse({ status: 200, statusText: 'OK', body: quizListTest })));
        service.fetchVisibleQuizzes();
        expect(service.quizzes).toEqual(quizListTest);
    });

    it('fetchVisibleQuizzes() should do nothing if HTTP request fails', () => {
        communicationServiceSpy.get.and.returnValue(of(new HttpResponse({ status: 500, statusText: 'Server Error' })));
        service.fetchVisibleQuizzes();
        expect(service.quizzes).toEqual([]);
    });

    it('checkQuizAvailability() should return true if quiz is in list', () => {
        communicationServiceSpy.get.and.returnValue(of(new HttpResponse({ status: 200, statusText: 'OK', body: quizListTest })));
        service.fetchVisibleQuizzes();
        expect(service.checkQuizAvailability(quizListTest[0])).toBeTrue();
    });

    it('checkQuizAvailability() should return false if quiz is undefined', () => {
        communicationServiceSpy.get.and.returnValue(of(new HttpResponse({ status: 200, statusText: 'OK', body: quizListTest })));
        service.fetchVisibleQuizzes();
        expect(service.checkQuizAvailability(undefined)).toBeFalse();
    });

    it('checkQuizAvailability() should return false if quiz is not in list', () => {
        communicationServiceSpy.get.and.returnValue(of(new HttpResponse({ status: 200, statusText: 'OK', body: [] })));
        service.fetchVisibleQuizzes();
        expect(service.checkQuizAvailability(quizListTest[0])).toBeFalse();
    });
});
