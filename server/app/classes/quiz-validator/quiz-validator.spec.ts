import { QuizValidator } from '@app/classes/quiz-validator/quiz-validator';
import { Answer, Question, Quiz } from '@common/quiz';
import { expect } from 'chai';

describe('QuizValidator', () => {
    const MOCK_ANSWERS: Answer[] = [
        {
            text: 'This is a test answer',
            isCorrect: true,
        },
        {
            text: 'This is a test answer',
            isCorrect: false,
        },
    ];
    const MOCK_QUESTIONS: Question[] = [
        {
            text: 'This is a test question',
            type: 'QCM',
            points: 10,
            choices: MOCK_ANSWERS,
            qrlAnswer: '',
        },
    ];
    const MOCK_QUIZ: Quiz = {
        id: '1',
        title: 'This is a test quiz',
        description: 'This is a test description',
        duration: 10,
        lastModification: new Date(),
        visible: true,
        questions: MOCK_QUESTIONS,
    };
    const EMPTY_QUIZ: Quiz = {
        id: undefined,
        title: '',
        description: '',
        duration: 0,
        lastModification: new Date(),
        visible: false,
        questions: [],
    };

    let quizValidator: QuizValidator;
    let getDataStub: (query: object) => Promise<Quiz[]>;

    beforeEach(() => {
        getDataStub = async (): Promise<Quiz[]> => [];
        quizValidator = new QuizValidator(MOCK_QUIZ, getDataStub);
    });

    it('should create a simple QuizValidator', async () => {
        expect(quizValidator).to.be.instanceOf(QuizValidator);
        const compiledQuiz = await quizValidator.compile();
        expect(compiledQuiz.data.title).to.equal(EMPTY_QUIZ.title);
        expect(compiledQuiz.data.description).to.equal(EMPTY_QUIZ.description);
        expect(compiledQuiz.data.duration).to.equal(EMPTY_QUIZ.duration);
        expect(compiledQuiz.data.visible).to.equal(EMPTY_QUIZ.visible);
        expect(compiledQuiz.data.questions).to.deep.equal(EMPTY_QUIZ.questions);
        expect(compiledQuiz.data.lastModification).to.be.instanceOf(Date);
        expect(compiledQuiz.data).to.have.property('id').that.is.a('string');
        expect(compiledQuiz.error).to.equal('');
    });

    it('should check if the quiz is an object and fail', async () => {
        quizValidator = new QuizValidator('This is a test quiz', getDataStub);
        const compiledQuiz = await quizValidator.validate();
        expect(compiledQuiz.error).to.equal('Quiz : doit être un objet !\n');
    });

    it('should check id', async () => {
        quizValidator.checkId();
        const compiledQuiz = await quizValidator.compile();
        expect(compiledQuiz.error).to.equal('');
        expect(compiledQuiz.data.id).to.equal(MOCK_QUIZ.id);
    });

    it('should check id and generate a new one', async () => {
        quizValidator = new QuizValidator(EMPTY_QUIZ, getDataStub);
        quizValidator.checkId();
        const compiledQuiz = await quizValidator.compile();
        expect(compiledQuiz.error).to.equal('');
        expect(compiledQuiz.data.id).to.be.a('string');
    });

    it('should check title', async () => {
        quizValidator.checkTitle();
        const compiledQuiz = await quizValidator.compile();
        expect(compiledQuiz.error).to.equal('');
        expect(compiledQuiz.data.title).to.equal(MOCK_QUIZ.title);
    });

    it('should check title and fail', async () => {
        quizValidator = new QuizValidator({}, getDataStub);
        quizValidator.checkTitle();
        const compiledQuiz = await quizValidator.compile();
        expect(compiledQuiz.error).to.equal('Quiz : titre manquant !\n');
        expect(compiledQuiz.data.title).to.equal(EMPTY_QUIZ.title);
    });

    it('should check title and fail if it is not an object', async () => {
        quizValidator = new QuizValidator('This is a test quiz', getDataStub);
        quizValidator.checkTitle();
        const compiledQuiz = await quizValidator.validate();
        expect(compiledQuiz.error).to.equal('Quiz : doit être un objet !\n');
        expect(compiledQuiz.data.title).to.equal(EMPTY_QUIZ.title);
    });

    it('should check title and fail if the name is not unique', async () => {
        quizValidator = new QuizValidator(MOCK_QUIZ, async (): Promise<Quiz[]> => [MOCK_QUIZ]);
        quizValidator.checkTitle();
        const compiledQuiz = await quizValidator.compile();
        expect(compiledQuiz.error).to.equal('Quiz : titre déjà utilisé !\n');
        expect(compiledQuiz.data.title).to.equal(EMPTY_QUIZ.title);
    });

    it('should check description', async () => {
        quizValidator.checkDescription();
        const compiledQuiz = await quizValidator.compile();
        expect(compiledQuiz.error).to.equal('');
        expect(compiledQuiz.data.description).to.equal(MOCK_QUIZ.description);
    });

    it('should check description and fail', async () => {
        quizValidator = new QuizValidator({}, getDataStub);
        quizValidator.checkDescription();
        const compiledQuiz = await quizValidator.compile();
        expect(compiledQuiz.error).to.equal('Quiz : description manquante !\n');
        expect(compiledQuiz.data.description).to.equal(EMPTY_QUIZ.description);
    });

    it('should check description and fail if it is not an object', async () => {
        quizValidator = new QuizValidator('This is a test quiz', getDataStub);
        quizValidator.checkDescription();
        const compiledQuiz = await quizValidator.validate();
        expect(compiledQuiz.error).to.equal('Quiz : doit être un objet !\n');
        expect(compiledQuiz.data.description).to.equal(EMPTY_QUIZ.description);
    });

    it('should check duration', async () => {
        quizValidator.checkDuration();
        const compiledQuiz = await quizValidator.compile();
        expect(compiledQuiz.error).to.equal('');
        expect(compiledQuiz.data.duration).to.equal(MOCK_QUIZ.duration);
    });

    it('should check duration and fail', async () => {
        quizValidator = new QuizValidator({}, getDataStub);
        quizValidator.checkDuration();
        const compiledQuiz = await quizValidator.compile();
        expect(compiledQuiz.error).to.equal('Quiz : durée manquante !\n');
        expect(compiledQuiz.data.duration).to.equal(EMPTY_QUIZ.duration);
    });

    it('should check duration and fail if it is not an object', async () => {
        quizValidator = new QuizValidator('This is a test quiz', getDataStub);
        quizValidator.checkDuration();
        const compiledQuiz = await quizValidator.validate();
        expect(compiledQuiz.error).to.equal('Quiz : doit être un objet !\n');
        expect(compiledQuiz.data.duration).to.equal(EMPTY_QUIZ.duration);
    });

    it('should check duration and fail if it is below 10', async () => {
        quizValidator = new QuizValidator({ ...MOCK_QUIZ, duration: 5 }, getDataStub);
        quizValidator.checkDuration();
        const compiledQuiz = await quizValidator.compile();
        expect(compiledQuiz.error).to.equal('Quiz : durée doit être entre 10 et 60 minutes !\n');
        expect(compiledQuiz.data.duration).to.equal(0);
    });

    it('should check duration and fail if it is above 60', async () => {
        quizValidator = new QuizValidator({ ...MOCK_QUIZ, duration: 65 }, getDataStub);
        quizValidator.checkDuration();
        const compiledQuiz = await quizValidator.compile();
        expect(compiledQuiz.error).to.equal('Quiz : durée doit être entre 10 et 60 minutes !\n');
        expect(compiledQuiz.data.duration).to.equal(0);
    });

    it('should check questions', async () => {
        quizValidator.checkQuestions();
        const compiledQuiz = await quizValidator.compile();
        expect(compiledQuiz.error).to.equal('');
        expect(compiledQuiz.data.questions).to.deep.equal(MOCK_QUIZ.questions);
    });

    it('should check questions and fail', async () => {
        quizValidator = new QuizValidator({}, getDataStub);
        quizValidator.checkQuestions();
        const compiledQuiz = await quizValidator.compile();
        expect(compiledQuiz.error).to.equal('Quiz : questions manquantes !\n');
        expect(compiledQuiz.data.questions).to.deep.equal(EMPTY_QUIZ.questions);
    });

    it('should check questions and fail if it is not an object', async () => {
        quizValidator = new QuizValidator('This is a test quiz', getDataStub);
        quizValidator.checkQuestions();
        const compiledQuiz = await quizValidator.validate();
        expect(compiledQuiz.error).to.equal('Quiz : doit être un objet !\n');
        expect(compiledQuiz.data.questions).to.deep.equal(EMPTY_QUIZ.questions);
    });

    it('should check questions and fail if it is not an array', async () => {
        quizValidator = new QuizValidator({ ...MOCK_QUIZ, questions: {} }, getDataStub);
        quizValidator.checkQuestions();
        const compiledQuiz = await quizValidator.compile();
        expect(compiledQuiz.error).to.equal('Quiz : questions manquantes !\n');
        expect(compiledQuiz.data.questions).to.deep.equal(EMPTY_QUIZ.questions);
    });

    it('should check questions and fail if there are no questions', async () => {
        quizValidator = new QuizValidator({ ...MOCK_QUIZ, questions: [] }, getDataStub);
        quizValidator.checkQuestions();
        const compiledQuiz = await quizValidator.compile();
        expect(compiledQuiz.error).to.equal('Quiz : doit avoir au moins une question !\n');
        expect(compiledQuiz.data.questions).to.deep.equal(EMPTY_QUIZ.questions);
    });

    it('should check questions and fail if they arent valid', async () => {
        quizValidator = new QuizValidator({ ...MOCK_QUIZ, questions: ['This is a test question'] }, getDataStub);
        quizValidator.checkQuestions();
        const compiledQuiz = await quizValidator.compile();
        expect(compiledQuiz.error).to.equal('Question : doit être un objet !\n');
        expect(compiledQuiz.data.questions).to.deep.equal(EMPTY_QUIZ.questions);
    });

    it('should check visibility and fail', async () => {
        quizValidator = new QuizValidator({ ...MOCK_QUIZ, visible: '' }, getDataStub);
        quizValidator.checkVisibility();
        const compiledQuiz = await quizValidator.compile();
        expect(compiledQuiz.error).to.equal('');
        expect(compiledQuiz.data.visible).to.equal(false);
    });
});
