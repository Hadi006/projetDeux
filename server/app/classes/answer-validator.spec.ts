import { AnswerValidator } from '@app/classes/answer-validator';
import { Answer } from '@common/quiz';
import { expect } from 'chai';

describe('AnswerValidator', () => {
    const MOCK_ANSWER: Answer = {
        text: 'This is a test answer',
        isCorrect: true,
    };

    let answerValidator: AnswerValidator;

    beforeEach(() => {
        answerValidator = new AnswerValidator(MOCK_ANSWER);
    });

    it('should create a simple AnswerValidator', () => {
        expect(answerValidator).to.be.instanceOf(AnswerValidator);
        const compiledAnswer = answerValidator.compile();
        expect(compiledAnswer.data).to.deep.equal({ text: '', isCorrect: false });
        expect(compiledAnswer.error).to.equal('');
    });

    it('should check if the answer is an object and fail', () => {
        answerValidator = new AnswerValidator('This is a test answer');
        const compiledAnswer = answerValidator.validate();
        expect(compiledAnswer.data).to.deep.equal({ text: '', isCorrect: false });
        expect(compiledAnswer.error).to.equal('Reponse : doit être un objet !\n');
    });

    it('should check if the answer has a text', () => {
        answerValidator.checkText();
        const compiledAnswer = answerValidator.compile();
        expect(compiledAnswer.data).to.deep.equal({ ...MOCK_ANSWER, isCorrect: false });
        expect(compiledAnswer.error).to.equal('');
    });

    it('should check if the answer has a text and fail', () => {
        answerValidator = new AnswerValidator({ isCorrect: true });
        answerValidator.checkText();
        const compiledAnswer = answerValidator.compile();
        expect(compiledAnswer.data).to.deep.equal({ text: '', isCorrect: false });
        expect(compiledAnswer.error).to.equal('Reponse : texte manquant !\n');
    });

    it('should check if the answer has a text and fail if it is not an object', () => {
        answerValidator = new AnswerValidator('This is a test answer');
        answerValidator.checkText();
        const compiledAnswer = answerValidator.validate();
        expect(compiledAnswer.data).to.deep.equal({ text: '', isCorrect: false });
        expect(compiledAnswer.error).to.equal('Reponse : doit être un objet !\n');
    });

    it('should check if the answer has a type', () => {
        answerValidator.checkText().checkType();
        const compiledAnswer = answerValidator.compile();
        expect(compiledAnswer.data).to.deep.equal(MOCK_ANSWER);
        expect(compiledAnswer.error).to.equal('');
    });

    it('should check if the answer has a type and fail', () => {
        answerValidator = new AnswerValidator({ text: 'This is a test answer' });
        answerValidator.checkText().checkType();
        const compiledAnswer = answerValidator.compile();
        expect(compiledAnswer.data).to.deep.equal({ text: 'This is a test answer', isCorrect: false });
        expect(compiledAnswer.error).to.equal('Reponse : type manquant !\n');
    });

    it('should check if the answer has a type and fail if it is not an object', () => {
        answerValidator = new AnswerValidator('This is a test answer');
        answerValidator.checkText().checkType();
        const compiledAnswer = answerValidator.validate();
        expect(compiledAnswer.data).to.deep.equal({ text: '', isCorrect: false });
        expect(compiledAnswer.error).to.equal('Reponse : doit être un objet !\n');
    });
});
