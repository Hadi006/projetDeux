import { Question, Quiz } from '@common/quiz';

const QUESTION_TEST_1: Question = {
    id: '20',
    text: 'mmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmm',
    type: 'QCM',
    points: 50,
    choices: [
        { text: 'messi', isCorrect: false },
        { text: 'neymar', isCorrect: true },
    ],
};

const QUESTION_TEST_2: Question = {
    id: '30',
    text: 'your name',
    type: 'QCM',
    points: 50,
    choices: [
        { text: 'ali', isCorrect: false },
        { text: 'hadi', isCorrect: true },
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
