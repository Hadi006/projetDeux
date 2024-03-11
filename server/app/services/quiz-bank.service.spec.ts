import { DatabaseService } from '@app/services/database.service';
import { QuizBankService } from '@app/services/quiz-bank.service';
import { Answer, Question, Quiz } from '@common/quiz';
import { expect } from 'chai';
import { SinonStubbedInstance, createStubInstance } from 'sinon';

describe('QuizBankService', () => {
    const MOCK_ANSWERS: Answer[] = [
        { text: 'Answer 1', isCorrect: true },
        { text: 'Answer 2', isCorrect: false },
    ];
    const MOCK_QUESTION: Question = {
        id: '1',
        text: 'Question 1',
        type: 'QCM',
        points: 10,
        choices: MOCK_ANSWERS,
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
        const result = await quizBankService.getQuizzes();
        expect(databaseServiceStub.get.calledWith('quizzes')).to.equal(true);
        expect(result).to.deep.equal(quizzes);
    });

    it('should return a quiz', async () => {
        databaseServiceStub.get.resolves([MOCK_QUIZ]);
        const result = await quizBankService.getQuiz('1');
        expect(result).to.deep.equal(MOCK_QUIZ);
    });

    it('should return all visible quizzes', async () => {
        const quizzes = new Array(3).fill(MOCK_QUIZ);
        databaseServiceStub.get.resolves(quizzes);
        const result = await quizBankService.getVisibleQuizzes();
        expect(databaseServiceStub.get.calledWith('quizzes', { visible: true })).to.equal(true);
        expect(result).to.deep.equal(quizzes);
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
        const noIdQuestion = { ...MOCK_QUESTION };
        delete noIdQuestion.id;
        const exportFormatQuiz = { ...MOCK_QUIZ, questions: new Array(N_QUESTIONS).fill(noIdQuestion) };
        databaseServiceStub.get.resolves([exportFormatQuiz]);
        const result = await quizBankService.exportQuiz('1');
        expect(result).to.deep.equal(exportFormatQuiz);
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

        expect(result.quiz).to.ownProperty('id').to.be.a('string');
        expect(result.quiz.lastModification).to.be.a('Date');
        expect(result.quiz.title).to.equal(MOCK_QUIZ.title);
        expect(result.quiz.description).to.equal(MOCK_QUIZ.description);
        expect(result.quiz.visible).to.equal(false);
        expect(result.quiz.duration).to.equal(MOCK_QUIZ.duration);
        expect(result.quiz.questions.length).to.equal(MOCK_QUIZ.questions.length);
    });

    it('should have an error log if there is a missing field', async () => {
        const quiz = delete MOCK_QUIZ.title;
        databaseServiceStub.get.resolves([]);
        const result = await quizBankService.verifyQuiz(quiz);
        expect(result.errorLog).to.not.equal('');
    });

    it('should have an error log if name is already taken', async () => {
        databaseServiceStub.get.resolves([{ name: MOCK_QUIZ.title }]);
        const result = await quizBankService.verifyQuiz(MOCK_QUIZ);
        expect(result.errorLog).to.not.equal('');
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
});
