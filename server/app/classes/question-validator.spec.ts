import { QuestionValidator } from '@app/classes/question-validator';
import { Answer, Question } from '@common/quiz';
import { expect } from 'chai';

describe('QuestionValidator', () => {
    const MOCK_ANSWERS: Answer[] = [
        {
            text: 'This is a test answer',
            isCorrect: true,
        },
        {
            text: 'This is another test answer',
            isCorrect: false,
        },
    ];
    const MOCK_QUESTION: Question = {
        text: 'This is a test question',
        type: 'QCM',
        points: 10,
        choices: MOCK_ANSWERS,
    };
    const EMPTY_QUESTION: Question = {
        text: '',
        type: '',
        points: 0,
        choices: [],
    };

    let questionValidator: QuestionValidator;

    beforeEach(() => {
        questionValidator = new QuestionValidator(MOCK_QUESTION);
    });

    it('should create a simple QuestionValidator', () => {
        expect(questionValidator).to.be.instanceOf(QuestionValidator);
        const compiledQuestion = questionValidator.compile();
        expect(compiledQuestion.data).to.deep.equal(EMPTY_QUESTION);
        expect(compiledQuestion.error).to.equal('');
    });

    it('should check if the question is an object and fail', () => {
        questionValidator = new QuestionValidator('This is a test question');
        const compiledQuestion = questionValidator.compile();
        expect(compiledQuestion.data).to.deep.equal(EMPTY_QUESTION);
        expect(compiledQuestion.error).to.equal('Question : doit être un objet !\n');
    });

    it('should check if the question has a text', () => {
        questionValidator.checkText();
        const compiledQuestion = questionValidator.compile();
        expect(compiledQuestion.data).to.deep.equal({ ...EMPTY_QUESTION, text: MOCK_QUESTION.text });
        expect(compiledQuestion.error).to.equal('');
    });

    it('should check if the question has a text and fail', () => {
        questionValidator = new QuestionValidator({ type: 'multiple-choice', points: 10, choices: [] });
        questionValidator.checkText();
        const compiledQuestion = questionValidator.compile();
        expect(compiledQuestion.data).to.deep.equal(EMPTY_QUESTION);
        expect(compiledQuestion.error).to.equal('Question : texte manquant !\n');
    });

    it('should check if the question has a text and fail if it is not an object', () => {
        questionValidator = new QuestionValidator('This is a test question');
        questionValidator.checkText();
        const compiledQuestion = questionValidator.compile();
        expect(compiledQuestion.data).to.deep.equal(EMPTY_QUESTION);
        expect(compiledQuestion.error).to.equal('Question : doit être un objet !\n');
    });

    it('should check if the question has a type', () => {
        questionValidator.checkType();
        const compiledQuestion = questionValidator.compile();
        expect(compiledQuestion.data).to.deep.equal({ ...EMPTY_QUESTION, type: MOCK_QUESTION.type });
        expect(compiledQuestion.error).to.equal('');
    });

    it('should check if the question has a type and fail', () => {
        questionValidator = new QuestionValidator({ text: 'This is a test question', points: 10, choices: [] });
        questionValidator.checkType();
        const compiledQuestion = questionValidator.compile();
        expect(compiledQuestion.data).to.deep.equal(EMPTY_QUESTION);
        expect(compiledQuestion.error).to.equal('Question : type manquant !\n');
    });

    it('should check if the question has a type and fail if it is not an object', () => {
        questionValidator = new QuestionValidator('This is a test question');
        questionValidator.checkType();
        const compiledQuestion = questionValidator.compile();
        expect(compiledQuestion.data).to.deep.equal(EMPTY_QUESTION);
        expect(compiledQuestion.error).to.equal('Question : doit être un objet !\n');
    });

    it('should check if the question has a type and fail if the type is not valid', () => {
        questionValidator = new QuestionValidator({ text: 'This is a test question', type: 'test', points: 10, choices: [] });
        questionValidator.checkType();
        const compiledQuestion = questionValidator.compile();
        expect(compiledQuestion.data).to.deep.equal(EMPTY_QUESTION);
        expect(compiledQuestion.error).to.equal('Question : type doit être QCM ou QRL !\n');
    });

    it('should check if the question has points', () => {
        questionValidator.checkPoints();
        const compiledQuestion = questionValidator.compile();
        expect(compiledQuestion.data).to.deep.equal({ ...EMPTY_QUESTION, points: MOCK_QUESTION.points });
        expect(compiledQuestion.error).to.equal('');
    });

    it('should check if the question has points and fail', () => {
        questionValidator = new QuestionValidator({ text: 'This is a test question', type: 'multiple-choice', choices: [] });
        questionValidator.checkPoints();
        const compiledQuestion = questionValidator.compile();
        expect(compiledQuestion.data).to.deep.equal(EMPTY_QUESTION);
        expect(compiledQuestion.error).to.equal('Question : points manquants !\n');
    });

    it('should check if the question has points and fail if it is not an object', () => {
        questionValidator = new QuestionValidator('This is a test question');
        questionValidator.checkPoints();
        const compiledQuestion = questionValidator.compile();
        expect(compiledQuestion.data).to.deep.equal(EMPTY_QUESTION);
        expect(compiledQuestion.error).to.equal('Question : doit être un objet !\n');
    });

    it('should check if the question has points and fail if the points are not valid', () => {
        questionValidator = new QuestionValidator({ text: 'This is a test question', type: 'multiple-choice', points: 15, choices: [] });
        questionValidator.checkPoints();
        const compiledQuestion = questionValidator.compile();
        expect(compiledQuestion.data).to.deep.equal(EMPTY_QUESTION);
        expect(compiledQuestion.error).to.equal('Question : points doit être un multiple de 10 et entre 10 et 100 !\n');
    });

    it('should check if the question has choices', () => {
        questionValidator.checkChoices();
        const compiledQuestion = questionValidator.compile();
        expect(compiledQuestion.data).to.deep.equal({ ...EMPTY_QUESTION, choices: MOCK_QUESTION.choices });
        expect(compiledQuestion.error).to.equal('');
    });

    it('should check if the question has choices and fail', () => {
        questionValidator = new QuestionValidator({ text: 'This is a test question', type: 'multiple-choice', points: 10 });
        questionValidator.checkChoices();
        const compiledQuestion = questionValidator.compile();
        expect(compiledQuestion.data).to.deep.equal(EMPTY_QUESTION);
        expect(compiledQuestion.error).to.equal('Question : choix manquants !\n');
    });

    it('should check if the question has choices and fail if it is not an object', () => {
        questionValidator = new QuestionValidator('This is a test question');
        questionValidator.checkChoices();
        const compiledQuestion = questionValidator.compile();
        expect(compiledQuestion.data).to.deep.equal(EMPTY_QUESTION);
        expect(compiledQuestion.error).to.equal('Question : doit être un objet !\n');
    });

    it('should check if the question has choices and fail if it is not an array', () => {
        questionValidator = new QuestionValidator({ text: 'This is a test question', type: 'multiple-choice', points: 10, choices: {} });
        questionValidator.checkChoices();
        const compiledQuestion = questionValidator.compile();
        expect(compiledQuestion.data).to.deep.equal(EMPTY_QUESTION);
        expect(compiledQuestion.error).to.equal('Question : choix manquants !\n');
    });

    it('should check if the question has choices and fail if there are not enough choices', () => {
        questionValidator = new QuestionValidator({
            text: 'This is a test question',
            type: 'multiple-choice',
            points: 10,
            choices: [MOCK_ANSWERS[0]],
        });
        questionValidator.checkChoices();
        const compiledQuestion = questionValidator.compile();
        expect(compiledQuestion.data).to.deep.equal(EMPTY_QUESTION);
        expect(compiledQuestion.error).to.equal('Question : doit avoir entre 2 et 4 choix !\n');
    });

    it('should check if the question has choices and fail if there are too many choices', () => {
        const nChoices = 5;
        questionValidator = new QuestionValidator({
            text: 'This is a test question',
            type: 'multiple-choice',
            points: 10,
            choices: new Array(nChoices).fill(MOCK_ANSWERS[0]),
        });
        questionValidator.checkChoices();
        const compiledQuestion = questionValidator.compile();
        expect(compiledQuestion.data).to.deep.equal(EMPTY_QUESTION);
        expect(compiledQuestion.error).to.equal('Question : doit avoir entre 2 et 4 choix !\n');
    });

    it('should check if the question has choices and fail if there are not enough correct choices', () => {
        questionValidator = new QuestionValidator({
            text: 'This is a test question',
            type: 'multiple-choice',
            points: 10,
            choices: [MOCK_ANSWERS[1], MOCK_ANSWERS[1]],
        });
        questionValidator.checkChoices();
        const compiledQuestion = questionValidator.compile();
        expect(compiledQuestion.data).to.deep.equal({ ...EMPTY_QUESTION, choices: [MOCK_ANSWERS[1], MOCK_ANSWERS[1]] });
        expect(compiledQuestion.error).to.equal('Question : doit avoir au moins une bonne et une mauvaise réponse !\n');
    });

    it('should check if the question has choices and fail if there are not enough incorrect choices', () => {
        questionValidator = new QuestionValidator({
            text: 'This is a test question',
            type: 'multiple-choice',
            points: 10,
            choices: [MOCK_ANSWERS[0], MOCK_ANSWERS[0]],
        });
        questionValidator.checkChoices();
        const compiledQuestion = questionValidator.compile();
        expect(compiledQuestion.data).to.deep.equal({ ...EMPTY_QUESTION, choices: [MOCK_ANSWERS[0], MOCK_ANSWERS[0]] });
        expect(compiledQuestion.error).to.equal('Question : doit avoir au moins une bonne et une mauvaise réponse !\n');
    });

    it("should check if the question has choices and fail if they aren't valid", () => {
        questionValidator = new QuestionValidator({
            text: 'This is a test question',
            type: 'multiple-choice',
            points: 10,
            choices: [MOCK_ANSWERS[0], { text: 'This is another test answer' }],
        });
        questionValidator.checkChoices();
        const compiledQuestion = questionValidator.compile();
        expect(compiledQuestion.data).to.deep.equal({
            ...EMPTY_QUESTION,
            choices: [MOCK_ANSWERS[0], { text: 'This is another test answer', isCorrect: false }],
        });
        expect(compiledQuestion.error).to.equal('Reponse : type manquant !\nQuestion : doit avoir au moins une bonne et une mauvaise réponse !\n');
    });
});
