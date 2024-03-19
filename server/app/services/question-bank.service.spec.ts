import { DatabaseService } from '@app/services/database.service';
import { QuestionBankService } from '@app/services/question-bank.service';
import { Question } from '@common/quiz';
import { expect } from 'chai';
import { createStubInstance, SinonStubbedInstance } from 'sinon';

describe('QuestionBankService', () => {
    const MOCK_QUESTION: Question = {
        text: 'Question 1',
        type: 'QCM',
        points: 10,
        choices: [
            { text: 'Answer 1', isCorrect: true },
            { text: 'Answer 2', isCorrect: false },
        ],
    };

    let questionBankService: QuestionBankService;
    let databaseServiceStub: SinonStubbedInstance<DatabaseService>;

    beforeEach(async () => {
        databaseServiceStub = createStubInstance(DatabaseService);
        questionBankService = new QuestionBankService(databaseServiceStub);
    });

    it('should return all questions', async () => {
        const questions = new Array(3).fill(MOCK_QUESTION);
        databaseServiceStub.get.resolves(questions);
        const result = await questionBankService.getQuestions();
        expect(result).to.deep.equal(questions);
    });

    it('should validate a question', () => {
        const result = questionBankService.validateQuestion(MOCK_QUESTION);
        expect(result).to.deep.equal({ data: MOCK_QUESTION, error: '' });
    });

    it('should invalidate a question', () => {
        const result = questionBankService.validateQuestion({ text: '1' });
        expect(result.error).to.not.equal('');
    });

    it('should update a question', async () => {
        databaseServiceStub.update.resolves(true);
        await questionBankService.updateQuestion(MOCK_QUESTION, MOCK_QUESTION.text);
        expect(databaseServiceStub.update.calledWith('questions', { text: MOCK_QUESTION.text }, [{ $set: MOCK_QUESTION }])).to.equal(true);
    });

    it('should add a question', async () => {
        databaseServiceStub.get.resolves([]);
        await questionBankService.addQuestion(MOCK_QUESTION);
        expect(databaseServiceStub.add.calledWith('questions', MOCK_QUESTION)).to.equal(true);
    });

    it('should not add a question', async () => {
        databaseServiceStub.get.resolves([MOCK_QUESTION]);
        const result = await questionBankService.addQuestion(MOCK_QUESTION);
        expect(databaseServiceStub.add.calledWith('questions', MOCK_QUESTION)).to.equal(false);
        expect(result).to.equal(false);
    });

    it('should delete a question', async () => {
        databaseServiceStub.delete.resolves(true);
        const result = await questionBankService.deleteQuestion('1');
        expect(databaseServiceStub.delete.calledWith('questions', { text: '1' })).to.equal(true);
        expect(result).to.equal(true);
    });

    it('should not delete a question', async () => {
        databaseServiceStub.delete.resolves(false);
        const result = await questionBankService.deleteQuestion('1');
        expect(databaseServiceStub.delete.calledWith('questions', { text: '1' })).to.equal(true);
        expect(result).to.equal(false);
    });
});
