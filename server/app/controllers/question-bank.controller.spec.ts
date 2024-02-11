import { Application } from '@app/app';
import { QuestionBankService } from '@app/services/question-bank.service';
import { expect } from 'chai';
import httpStatus from 'http-status-codes';
import { SinonStubbedInstance, createStubInstance, match } from 'sinon';
import * as supertest from 'supertest';
import { Container } from 'typedi';

describe('QuestionBankController', () => {
    const MOCK_QUESTIONS = [
        {
            id: '1',
            text: 'Question 1',
            type: 'multiple-choices',
            points: 10,
            choices: [
                { text: 'Answer 1', isCorrect: true },
                { text: 'Answer 2', isCorrect: false },
            ],
        },
        {
            id: '2',
            text: 'Question 2',
            type: 'multiple-choices',
            points: 10,
            choices: [
                { text: 'Answer 1', isCorrect: true },
                { text: 'Answer 2', isCorrect: false },
            ],
        },
    ];
    const PARAM_ID = '1';

    let questionBankServiceStub: SinonStubbedInstance<QuestionBankService>;
    let expressApp: Express.Application;

    beforeEach(async () => {
        questionBankServiceStub = createStubInstance(QuestionBankService);
        const app = Container.get(Application);
        Object.defineProperty(app['questionBankController'], 'questionBankService', { value: questionBankServiceStub });
        expressApp = app.app;
    });

    it('GET / should return questions from question service', async () => {
        questionBankServiceStub.getQuestions.resolves([...MOCK_QUESTIONS]);
        return supertest(expressApp)
            .get('/api/questions')
            .expect(httpStatus.OK)
            .then((response) => {
                expect(response.body).to.deep.equal(MOCK_QUESTIONS);
            });
    });

    it('GET / should return empty array', async () => {
        questionBankServiceStub.getQuestions.resolves([]);
        return supertest(expressApp)
            .get('/api/questions')
            .expect(httpStatus.NOT_FOUND)
            .then((response) => {
                expect(response.body).to.deep.equal([]);
            });
    });

    it('POST / should add a question', async () => {
        questionBankServiceStub.validateQuestion.returns({ question: { ...MOCK_QUESTIONS[0] }, compilationError: '' });
        questionBankServiceStub.addQuestion.resolves(true);
        return supertest(expressApp)
            .post('/api/questions')
            .send({ question: MOCK_QUESTIONS[0] })
            .expect(httpStatus.CREATED)
            .then((response) => {
                expect(questionBankServiceStub.validateQuestion.calledWith(match(MOCK_QUESTIONS[0]))).to.equal(true);
                expect(questionBankServiceStub.addQuestion.calledWith(match(MOCK_QUESTIONS[0]))).to.equal(true);
                expect(response.body.compilationError).to.equal('');
            });
    });

    it('POST / should return compilation error for invalid question', async () => {
        questionBankServiceStub.validateQuestion.returns({ question: MOCK_QUESTIONS[0], compilationError: 'error' });
        return supertest(expressApp)
            .post('/api/questions')
            .send({ question: MOCK_QUESTIONS[0] })
            .expect(httpStatus.BAD_REQUEST)
            .then((response) => {
                expect(questionBankServiceStub.addQuestion.called).to.equal(false);
                expect(response.body).to.deep.equal({ question: MOCK_QUESTIONS[0], compilationError: 'error' });
            });
    });

    it('POST / should return compilation error for duplicate question', async () => {
        questionBankServiceStub.validateQuestion.returns({ question: MOCK_QUESTIONS[0], compilationError: '' });
        questionBankServiceStub.addQuestion.resolves(false);
        return supertest(expressApp)
            .post('/api/questions')
            .send({ question: MOCK_QUESTIONS[0] })
            .expect(httpStatus.BAD_REQUEST)
            .then((response) => {
                expect(questionBankServiceStub.addQuestion.calledWith(match(MOCK_QUESTIONS[0]))).to.equal(true);
                expect(response.body).to.deep.equal({ question: MOCK_QUESTIONS[0], compilationError: 'Question : text must be unique !' });
            });
    });

    it('POST /validate should validate a question', async () => {
        questionBankServiceStub.validateQuestion.returns({ question: MOCK_QUESTIONS[0], compilationError: '' });
        return supertest(expressApp)
            .post('/api/questions/validate')
            .send({ question: MOCK_QUESTIONS[0] })
            .expect(httpStatus.OK)
            .then((response) => {
                expect(questionBankServiceStub.validateQuestion.calledWith(MOCK_QUESTIONS[0])).to.equal(true);
                expect(response.body).to.deep.equal({ question: MOCK_QUESTIONS[0], compilationError: '' });
            });
    });

    it('POST /validate should return compilation error', async () => {
        questionBankServiceStub.validateQuestion.returns({ question: MOCK_QUESTIONS[0], compilationError: 'error' });
        return supertest(expressApp)
            .post('/api/questions/validate')
            .send({ question: MOCK_QUESTIONS[0] })
            .expect(httpStatus.BAD_REQUEST)
            .then((response) => {
                expect(questionBankServiceStub.validateQuestion.calledWith(MOCK_QUESTIONS[0])).to.equal(true);
                expect(response.body).to.deep.equal({ question: MOCK_QUESTIONS[0], compilationError: 'error' });
            });
    });

    it('PATCH /:questionId should update a question', async () => {
        questionBankServiceStub.updateQuestion.resolves(true);
        questionBankServiceStub.validateQuestion.returns({ question: { ...MOCK_QUESTIONS[0] }, compilationError: '' });
        return supertest(expressApp)
            .patch(`/api/questions/${PARAM_ID}`)
            .send({ question: MOCK_QUESTIONS[0] })
            .expect(httpStatus.OK)
            .then((response) => {
                expect(questionBankServiceStub.validateQuestion.calledWith(match(MOCK_QUESTIONS[0]))).to.equal(true);
                expect(questionBankServiceStub.updateQuestion.calledOnce).to.equal(true);
                expect(response.body.compilationError).to.equal('');
            });
    });

    it('PATCH /:questionId should return 404 when no question is found', async () => {
        questionBankServiceStub.updateQuestion.resolves(false);
        questionBankServiceStub.validateQuestion.returns({ question: MOCK_QUESTIONS[0], compilationError: '' });
        return supertest(expressApp)
            .patch(`/api/questions/${PARAM_ID}`)
            .send({ question: MOCK_QUESTIONS[0] })
            .expect(httpStatus.NOT_FOUND)
            .then((response) => {
                expect(questionBankServiceStub.updateQuestion.calledWith(MOCK_QUESTIONS[0]), PARAM_ID).to.equal(true);
                expect(response.body.compilationError).to.equal('');
            });
    });

    it('PATCH /:questionId should return compilation error', async () => {
        questionBankServiceStub.validateQuestion.returns({ question: MOCK_QUESTIONS[0], compilationError: 'error' });
        return supertest(expressApp)
            .patch(`/api/questions/${PARAM_ID}`)
            .send({ question: MOCK_QUESTIONS[0] })
            .expect(httpStatus.BAD_REQUEST)
            .then((response) => {
                expect(questionBankServiceStub.updateQuestion.called).to.equal(false);
                expect(response.body.compilationError).not.to.equal('');
            });
    });

    it('DELETE /:questionId should delete a question', async () => {
        questionBankServiceStub.deleteQuestion.resolves(true);
        return supertest(expressApp)
            .delete(`/api/questions/${PARAM_ID}`)
            .expect(httpStatus.OK)
            .then((response) => {
                expect(questionBankServiceStub.deleteQuestion.calledWith(PARAM_ID)).to.equal(true);
                expect(response.body).to.deep.equal({});
            });
    });

    it('POST /:questionId/validate-answer should validate an answer', async () => {
        questionBankServiceStub.getQuestion.resolves(MOCK_QUESTIONS[0]);
        questionBankServiceStub.validateAnswer.resolves(true);
        return supertest(expressApp)
            .post(`/api/questions/${PARAM_ID}/validate-answer`)
            .send({ answer: [true, false] })
            .expect(httpStatus.OK)
            .then((response) => {
                expect(questionBankServiceStub.validateAnswer.calledWith(MOCK_QUESTIONS[0], [true, false])).to.equal(true);
                expect(response.body).to.equal(true);
            });
    });

    it('DELETE /:questionId should return 404 when no question is found', async () => {
        questionBankServiceStub.deleteQuestion.resolves(false);
        return supertest(expressApp)
            .delete(`/api/questions/${PARAM_ID}`)
            .expect(httpStatus.NOT_FOUND)
            .then((response) => {
                expect(questionBankServiceStub.deleteQuestion.calledWith(PARAM_ID)).to.equal(true);
                expect(response.body).to.deep.equal({});
            });
    });
});
