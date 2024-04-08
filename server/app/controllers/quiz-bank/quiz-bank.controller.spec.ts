import { Application } from '@app/app';
import { QuizBankService } from '@app/services/quiz-bank/quiz-bank.service';
import { Answer, Question, Quiz } from '@common/quiz';
import { expect } from 'chai';
import httpStatus from 'http-status-codes';
import { SinonStubbedInstance, createStubInstance } from 'sinon';
import * as supertest from 'supertest';
import { Container } from 'typedi';

describe('QuizBankController', () => {
    const MOCK_ANSWER: Answer = { text: 'Answer 1', isCorrect: true };

    const MOCK_QUESTION: Question = {
        text: 'Question 1',
        type: 'QCM',
        points: 1,
        choices: [MOCK_ANSWER],
    };
    const MOCK_QUIZZES: Quiz[] = [
        {
            id: '1',
            title: 'Quiz 1',
            description: 'description',
            visible: true,
            lastModification: new Date(),
            duration: 0,
            questions: [MOCK_QUESTION],
        },
        {
            id: '2',
            title: 'Quiz 2',
            description: 'description',
            visible: false,
            lastModification: new Date(),
            duration: 0,
            questions: [MOCK_QUESTION],
        },
    ];
    const EXPECTED_QUIZZES = MOCK_QUIZZES.map((quiz) => ({
        ...quiz,
        lastModification: quiz.lastModification.toISOString(),
    }));

    let quizBankServiceStub: SinonStubbedInstance<QuizBankService>;
    let expressApp: Express.Application;

    beforeEach(async () => {
        quizBankServiceStub = createStubInstance(QuizBankService);
        const app = Container.get(Application);
        Object.defineProperty(app['quizBankController'], 'quizBankService', { value: quizBankServiceStub });
        expressApp = app.app;
    });

    it('GET / should return quizzes from quiz service', async () => {
        quizBankServiceStub.getQuizzes.resolves(MOCK_QUIZZES);

        return supertest(expressApp)
            .get('/api/quizzes')
            .expect(httpStatus.OK)
            .then((response) => {
                expect(response.body).to.deep.equal(EXPECTED_QUIZZES);
            });
    });

    it('GET / should return 404 when no quizzes are found', async () => {
        quizBankServiceStub.getQuizzes.resolves(null);

        return supertest(expressApp)
            .get('/api/quizzes')
            .expect(httpStatus.NOT_FOUND)
            .then((response) => {
                expect(response.body).to.deep.equal(null);
            });
    });

    it('GET /:quizId should return a quiz from quiz service', async () => {
        const expectedQuiz = EXPECTED_QUIZZES[0];
        quizBankServiceStub.getQuiz.resolves(JSON.parse(JSON.stringify(MOCK_QUIZZES[0])));

        return supertest(expressApp)
            .get(`/api/quizzes/${expectedQuiz.id}`)
            .expect(httpStatus.OK)
            .then((response) => {
                expect(response.body).to.deep.equal(expectedQuiz);
            });
    });

    it('GET /:quizId should return 404 when no quiz is found', async () => {
        quizBankServiceStub.getQuiz.resolves(null);

        return supertest(expressApp)
            .get('/api/quizzes/1')
            .expect(httpStatus.NOT_FOUND)
            .then((response) => {
                expect(response.body).to.deep.equal(null);
            });
    });

    it('GET /:quizId/download should return a quiz from quiz service', async () => {
        const expectedQuiz = EXPECTED_QUIZZES[0];
        const noIdQuestion = { ...MOCK_QUESTION };
        quizBankServiceStub.exportQuiz.resolves({ ...MOCK_QUIZZES[0], questions: [noIdQuestion] });

        return supertest(expressApp)
            .get(`/api/quizzes/${expectedQuiz.id}/download`)
            .expect(httpStatus.OK)
            .then((response) => {
                expect(response.header['content-disposition']).to.equal('attachment; filename=quiz.json');
                expect(response.header['content-type']).to.equal('application/json');
                expect(response.body).to.deep.equal(expectedQuiz);
            });
    });

    it('GET /:quizId/download should return 404 when no quiz is found', async () => {
        quizBankServiceStub.exportQuiz.resolves(null);

        return supertest(expressApp)
            .get('/api/quizzes/1/download')
            .expect(httpStatus.NOT_FOUND)
            .then((response) => {
                expect(response.header['content-disposition']).to.equal(undefined);
                expect(response.header['content-type']).to.equal('application/json; charset=utf-8');
                expect(response.body).to.deep.equal({});
            });
    });

    it('POST / should add a valid quiz to the quiz service', async () => {
        const expectedQuiz = EXPECTED_QUIZZES[0];
        quizBankServiceStub.verifyQuiz.resolves({ data: { ...MOCK_QUIZZES[0], title: 'New title' }, error: '' });
        quizBankServiceStub.addQuiz.resolves();

        return supertest(expressApp)
            .post('/api/quizzes')
            .send({ quiz: expectedQuiz, newTitle: 'New title' })
            .expect(httpStatus.CREATED)
            .then((response) => {
                expect(quizBankServiceStub.verifyQuiz.calledOnceWith({ ...expectedQuiz, title: 'New title' })).to.equal(true);
                expect(response.body).to.deep.equal({ data: { ...expectedQuiz, title: 'New title' }, error: '' });
            });
    });

    it('POST / shouldnt add an invalid quiz to the quiz service', async () => {
        const expectedQuiz = EXPECTED_QUIZZES[0];
        const errorLog = 'Invalid quiz';
        quizBankServiceStub.verifyQuiz.resolves({ data: MOCK_QUIZZES[0], error: errorLog });

        return supertest(expressApp)
            .post('/api/quizzes')
            .send({ quiz: expectedQuiz })
            .expect(httpStatus.BAD_REQUEST)
            .then((response) => {
                expect(quizBankServiceStub.addQuiz.called).to.equal(false);
                expect(response.body).to.deep.equal({ data: expectedQuiz, error: errorLog });
            });
    });

    it('PATCH /:quizId should update a valid quiz in the quiz service', async () => {
        const expectedQuiz = EXPECTED_QUIZZES[0];
        quizBankServiceStub.verifyQuiz.resolves({ data: MOCK_QUIZZES[0], error: '' });

        return supertest(expressApp)
            .patch(`/api/quizzes/${expectedQuiz.id}`)
            .send({ quiz: expectedQuiz })
            .expect(httpStatus.OK)
            .then((response) => {
                expect(quizBankServiceStub.verifyQuiz.calledOnceWith(expectedQuiz)).to.equal(true);
                expect(response.body).to.deep.equal({});
            });
    });

    it('PATCH /:quizId shouldnt update an invalid quiz in the quiz service', async () => {
        const expectedQuiz = EXPECTED_QUIZZES[0];
        const errorLog = 'Invalid quiz';
        quizBankServiceStub.verifyQuiz.resolves({ data: MOCK_QUIZZES[0], error: errorLog });

        return supertest(expressApp)
            .patch(`/api/quizzes/${expectedQuiz.id}`)
            .send({ quiz: expectedQuiz })
            .expect(httpStatus.BAD_REQUEST)
            .then((response) => {
                expect(quizBankServiceStub.verifyQuiz.calledOnceWith(expectedQuiz)).to.equal(true);
                expect(response.body).to.deep.equal({ data: expectedQuiz, error: errorLog });
            });
    });

    it('PATCH /:quizId/visibility should change the visibility of a quiz', async () => {
        const expectedQuiz = EXPECTED_QUIZZES[0];
        quizBankServiceStub.changeQuizVisibility.resolves(true);

        return supertest(expressApp)
            .patch(`/api/quizzes/${expectedQuiz.id}/visibility`)
            .expect(httpStatus.OK)
            .then((response) => {
                expect(quizBankServiceStub.changeQuizVisibility.calledOnceWith(expectedQuiz.id)).to.equal(true);
                expect(response.body).to.deep.equal({});
            });
    });

    it('PATCH /:quizId/visibility should return 404 when no quiz is found', async () => {
        quizBankServiceStub.changeQuizVisibility.resolves(false);

        return supertest(expressApp)
            .patch('/api/quizzes/1/visibility')
            .expect(httpStatus.NOT_FOUND)
            .then((response) => {
                expect(quizBankServiceStub.changeQuizVisibility.calledOnceWith('1')).to.equal(true);
                expect(response.body).to.deep.equal({});
            });
    });

    it('DELETE /:quizId should delete a quiz', async () => {
        const expectedQuiz = EXPECTED_QUIZZES[0];
        quizBankServiceStub.deleteQuiz.resolves();

        return supertest(expressApp)
            .delete(`/api/quizzes/${expectedQuiz.id}`)
            .expect(httpStatus.OK)
            .then((response) => {
                expect(quizBankServiceStub.deleteQuiz.calledOnceWith(expectedQuiz.id)).to.equal(true);
                expect(response.body).to.deep.equal({});
            });
    });

    it('DELETE /:quizId should return 404 when no quiz is found', async () => {
        quizBankServiceStub.deleteQuiz.resolves();

        return supertest(expressApp)
            .delete('/api/quizzes/1')
            .expect(httpStatus.OK)
            .then((response) => {
                expect(quizBankServiceStub.deleteQuiz.calledOnceWith('1')).to.equal(true);
                expect(response.body).to.deep.equal({});
            });
    });
});
