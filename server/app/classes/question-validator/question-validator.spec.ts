/* eslint-disable max-lines */
import { QuestionValidator } from '@app/classes/question-validator/question-validator';
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
        qrlAnswer: '',
    };
    const EMPTY_QUESTION: Question = {
        text: '',
        type: '',
        points: 0,
        choices: [],
        qrlAnswer: '',
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
        const compiledQuestion = questionValidator.validate();
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
        const compiledQuestion = questionValidator.validate();
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
        const compiledQuestion = questionValidator.validate();
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
        const compiledQuestion = questionValidator.validate();
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
        // Arrange
        const question = {
            text: 'Sample question',
            type: 'QCM',
            points: 10,
            choices: [
                { text: 'Option 1', isCorrect: true },
                { text: 'Option 2', isCorrect: false },
            ],
            qrlAnswer: '',
        };
        // const questionValidator = new QuestionValidator(question);

        // Act
        questionValidator.checkChoices();
        const compiledQuestion = questionValidator.compile();

        // Assert
        expect(compiledQuestion.data).to.deep.equal({ ...EMPTY_QUESTION, choices: question.choices });
        expect(compiledQuestion.error).to.equal('');
    });

    it('should check if the question has choices and fail if it is not an object', () => {
        questionValidator = new QuestionValidator('This is a test question');
        questionValidator.checkChoices();
        const compiledQuestion = questionValidator.validate();
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

    it('should check if the question has choices and fail if choices are not an array', () => {
        questionValidator = new QuestionValidator({ text: 'This is a test question', type: 'multiple-choice', points: 10, choices: {} });
        questionValidator.checkChoices();
        const compiledQuestion = questionValidator.compile();
        expect(compiledQuestion.error).to.equal('Question : choix manquants !\n');
    });

    it('should pass if the question is of type QCM and has the correct number of choices', () => {
        // Arrange
        const qs = new QuestionValidator({
            text: 'Sample question',
            type: 'QCM',
            points: 10,
            choices: [
                { text: 'Choice 1', isCorrect: true },
                { text: 'Choice 2', isCorrect: false },
            ],
            qrlAnswer: '',
        });

        // Act
        qs.checkChoices();
        const validationResult = qs.compile();

        // Assert
        expect(validationResult.error).to.equal('');
    });
});
