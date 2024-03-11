import { Question, Quiz } from '@common/quiz';

const QUESTION_TEST_1: Question = {
    id: '20',
    text: 'MVP',
    type: 'QCM',
    points: 50,
    choices: [
        { text: 'messi', isCorrect: false },
        { text: 'neymar', isCorrect: true },
    ],
};

const QUESTION_TEST_2: Question = {
    id: '30',
    text: 'LOUNA RA& TNAFIKH SHFEFA?',
    type: 'QCM',
    points: 50,
    choices: [
        { text: 'LAA MA BTAAMELA', isCorrect: false },
        { text: 'EH W RAH TEKOL BLOCK', isCorrect: true },
    ],
};
export const QUESTION_TEST = [QUESTION_TEST_1, QUESTION_TEST_2];

export const QUIZ_TEST_1: Quiz = {
    id: '2',
    title: 'FIFA',
    visible: true,
    description: 'fortnite game',
    duration: 10,
    lastModification: new Date(),
    questions: QUESTION_TEST,
};
