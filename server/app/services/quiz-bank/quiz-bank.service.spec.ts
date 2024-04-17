import { DatabaseService } from '@app/services/database/database.service';
import { QuizBankService } from '@app/services/quiz-bank/quiz-bank.service';
import { QuestionType } from '@common/constant';
import { Answer, Question, Quiz } from '@common/quiz';
import { expect } from 'chai';
import { Request } from 'express';
import { SinonStubbedInstance, createStubInstance } from 'sinon';

describe('QuizBankService', () => {
    const MOCK_ANSWERS: Answer[] = [
        { text: 'Answer 1', isCorrect: true },
        { text: 'Answer 2', isCorrect: false },
    ];
    const MOCK_QUESTION: Question = {
        text: 'Question 1',
        type: QuestionType.Qcm,
        points: 10,
        choices: MOCK_ANSWERS,
        qrlAnswer: '',
    };
    const N_QUESTIONS = 4;
    const MOCK_QUIZ: Quiz = {
        id: '1',
        title: 'Quiz 1',
        description: 'description',
        visible: true,
        lastModification: new Date(),
        duration: 10,
        questions: new Array(N_QUESTIONS).fill(MOCK_QUESTION),
    };

    let quizBankService: QuizBankService;
    let databaseServiceStub: SinonStubbedInstance<DatabaseService>;

    beforeEach(async () => {
        databaseServiceStub = createStubInstance(DatabaseService);
        quizBankService = new QuizBankService(databaseServiceStub);
    });

    it('should return all quizzes', async () => {
        const quizzes = new Array(3).fill(MOCK_QUIZ);
        databaseServiceStub.get.resolves(quizzes);
        const result = await quizBankService.getQuizzes({} as Request);
        expect(databaseServiceStub.get.calledWith('quizzes')).to.equal(true);
        expect(result).to.deep.equal(quizzes);
    });

    it('should return quizzes with query', async () => {
        const quizzes = new Array(3).fill(MOCK_QUIZ);
        databaseServiceStub.get.resolves(quizzes);
        const result = await quizBankService.getQuizzes({
            query: { id: '1', title: 'Quiz 1', visible: 'true', description: 'description', duration: '10' },
        } as unknown as Request);
        expect(result).to.deep.equal(quizzes);
    });

    it('should return a quiz', async () => {
        databaseServiceStub.get.resolves([MOCK_QUIZ]);
        const result = await quizBankService.getQuiz('1');
        expect(result).to.deep.equal(MOCK_QUIZ);
    });

    it('should return a quiz', async () => {
        databaseServiceStub.get.resolves([MOCK_QUIZ]);
        const result = await quizBankService.exportQuiz('1');
        expect(result).to.deep.equal(MOCK_QUIZ);
    });

    it('should return undefined', async () => {
        databaseServiceStub.get.resolves([]);
        const result = await quizBankService.exportQuiz('1');
        expect(result).to.equal(undefined);
    });

    it('should return a quiz without question ids', async () => {
        databaseServiceStub.get.resolves([MOCK_QUIZ]);
        const result = await quizBankService.exportQuiz('1');
        expect(result).to.deep.equal(MOCK_QUIZ);
    });

    it('should add a quiz', async () => {
        databaseServiceStub.get.resolves([]);
        await quizBankService.addQuiz(MOCK_QUIZ);
        expect(databaseServiceStub.add.calledWith('quizzes', MOCK_QUIZ)).to.equal(true);
    });

    it('shouldnt add a quiz if it already exists', async () => {
        databaseServiceStub.get.resolves([MOCK_QUIZ]);
        await quizBankService.addQuiz(MOCK_QUIZ);
        expect(databaseServiceStub.add.called).to.equal(false);
        expect(databaseServiceStub.update.calledWith('quizzes', { id: MOCK_QUIZ.id }, [{ $set: MOCK_QUIZ }])).to.equal(true);
    });

    it('should verify a quiz and return a replica', async () => {
        databaseServiceStub.get.resolves([]);
        const result = await quizBankService.verifyQuiz(MOCK_QUIZ);

        expect(result.data).to.ownProperty('id').to.be.a('string');
        expect(result.data.lastModification).to.be.a('Date');
        expect(result.data.title).to.equal(MOCK_QUIZ.title);
        expect(result.data.description).to.equal(MOCK_QUIZ.description);
        expect(result.data.visible).to.equal(MOCK_QUIZ.visible);
        expect(result.data.duration).to.equal(MOCK_QUIZ.duration);
        expect(result.data.questions.length).to.equal(MOCK_QUIZ.questions.length);
    });

    it('should have an error log if there is a missing field', async () => {
        const quiz = delete MOCK_QUIZ.title;
        databaseServiceStub.get.resolves([]);
        const result = await quizBankService.verifyQuiz(quiz);
        expect(result.error).to.not.equal('');
    });

    it('should have an error log if name is already taken', async () => {
        databaseServiceStub.get.resolves([{ name: MOCK_QUIZ.title }]);
        const result = await quizBankService.verifyQuiz(MOCK_QUIZ);
        expect(result.error).to.not.equal('');
    });

    it('should update a quiz', async () => {
        databaseServiceStub.update.resolves(true);
        await quizBankService.updateQuiz(MOCK_QUIZ);
        expect(databaseServiceStub.update.calledWith('quizzes', { id: MOCK_QUIZ.id }, [{ $set: MOCK_QUIZ }])).to.equal(true);
    });

    it('should add a quiz if the update fails', async () => {
        databaseServiceStub.update.resolves(false);
        await quizBankService.updateQuiz(MOCK_QUIZ);
        expect(databaseServiceStub.add.calledWith('quizzes', MOCK_QUIZ)).to.equal(true);
    });

    it('should change the visibility of a quiz', async () => {
        databaseServiceStub.update.resolves(true);
        const result = await quizBankService.changeQuizVisibility('1');
        expect(databaseServiceStub.update.calledWith('quizzes', { id: '1' }, [{ $set: { visible: { $not: '$visible' } } }])).to.equal(true);
        expect(result).to.equal(true);
    });

    it('shouldnt change the visibility if the update fails', async () => {
        databaseServiceStub.update.resolves(false);
        const result = await quizBankService.changeQuizVisibility('1');
        expect(result).to.equal(false);
    });

    it('should delete a quiz', async () => {
        await quizBankService.deleteQuiz('1');
        expect(databaseServiceStub.delete.calledWith('quizzes', { id: '1' })).to.equal(true);
    });

    it('should export a quiz', async () => {
        const mockQuiz = { ...MOCK_QUIZ };
        mockQuiz.questions[0].type = QuestionType.Qrl;
        databaseServiceStub.get.resolves([mockQuiz]);
        const result = await quizBankService.exportQuiz('1');
        expect(result).to.equal(mockQuiz);
    });

    it('should not export a quiz', async () => {
        databaseServiceStub.get.resolves(undefined);
        const result = await quizBankService.exportQuiz('1');
        expect(result).to.equal(undefined);
    });
});
