import { AccessToken } from '@common/access-token';
import { Game } from '@common/game';
import { Player } from '@common/player';
import { Answer, Question, Quiz } from '@common/quiz';
import { HistogramData } from './histogram-data';

/* Components */
export const DEFAULT_WIDTH = 200;
export const DEFAULT_HEIGHT = 200;
export enum MouseButton {
    Left = 0,
    Middle = 1,
    Right = 2,
    Back = 3,
    Forward = 4,
}

export enum QuestionType {
    Qcm = 'QCM',
    Qrl = 'QRL',
}

export const SELECTED_MULTIPLIER = 0.5;

/* Guards */
export const UNAUTHORIZED_REDIRECT_URL = 'home/admin/login';
/* Pages */

/* Services */
export const INVALID_INDEX = -1;
export const MAX_MESSAGE_LENGTH = 200;
export const SHOW_ANSWER_DELAY = 3;
export const INVALID_TOKEN: AccessToken = { id: '', expirationDate: -1 };

export const GOOD_ANSWER_BONUS = 0.2;

export const LOWER_BOUND = 10;

export const UPPER_BOUND = 100;

export const MAX_CHOICES = 4;

export const MIN_DURATION = 10;

export const MAX_DURATION = 60;

export const INDENTATION = 4;

export const TOKEN_EXPIRATION = 3_600_000;

export const DB_URL = 'mongodb+srv://baiwuli:baiwuli@cluster0.wl2p6f7.mongodb.net/?retryWrites=true&w=majority';

export const POINT_INTERVAL = 10;

export const MIN_CHOICES = 2;

export const BLANK_QUIZ: Quiz = {
    id: '',
    title: '',
    visible: false,
    description: '',
    duration: 10,
    lastModification: new Date(),
    questions: [],
};

export const BLANK_QUESTION = {
    id: '',
    text: '',
    type: 'QCM',
    points: 0,
    choices: [
        { text: '', isCorrect: false },
        { text: '', isCorrect: false },
    ],
};

export const NEW_HISTOGRAM_DATA: HistogramData = {
    labels: [],
    datasets: [
        {
            label: 'Answers',
            data: [],
        },
    ],
};

export const GAME_ID_MAX = 10000;

export const GAME_ID_LENGTH = 4;

export const START_GAME_COUNTDOWN = 5;

export const TRANSITION_DELAY = 3;

export const ANSWER_TIME_BUFFER = 1000;

export const N_RANDOM_QUESTIONS = 5;

export const RANDOM_QUIZ_DURATION = 20;

export const RANDOM_QUIZ_ID = '-1';

export const QCM_TIME_FOR_PANIC = 5;

export const QRL_TIME_FOR_PANIC = 20;
export const PANIC_MODE_TIMER = 4;
export const POLL_RATE = 5000;

export const MAX_QRL_LENGTH = 200;

/* Classes */
export const TIMER_TICK_RATE = 1000;

export const TIMER_DECREMENT = 1;

export const PANIC_MODE_TICK_RATE = 250;

export const QRL_DURATION = 60;

/* Tests */
export const TEST_ANSWERS: Answer[] = [
    {
        text: 'Test Answer 1',
        isCorrect: false,
    },
    {
        text: 'Test Answer 2',
        isCorrect: false,
    },
];

export const TEST_QUESTIONS: Question[] = [
    {
        text: 'Test Question',
        type: QuestionType.Qcm,
        points: 10,
        lastModification: new Date(),
        choices: TEST_ANSWERS,
        qrlAnswer: '',
    },
    {
        text: 'Test Question 2',
        type: QuestionType.Qrl,
        points: 10,
        lastModification: new Date(),
        choices: TEST_ANSWERS,
        qrlAnswer: '',
    }
];

export const TEST_QUIZZES: Quiz[] = [
    {
        id: '1',
        title: 'Test Quiz',
        visible: true,
        description: 'Test Quiz Description',
        duration: 10,
        lastModification: new Date(),
        questions: TEST_QUESTIONS,
    },
    {
        id: '2',
        title: 'Test Quiz 2',
        visible: true,
        description: 'Test Quiz Description 2',
        duration: 10,
        lastModification: new Date(),
        questions: TEST_QUESTIONS,
    },
];

export const TEST_PLAYERS: Player[] = [
    {
        id: '1',
        name: 'Player 1',
        score: 0,
        questions: TEST_QUESTIONS,
        fastestResponseCount: 0,
        muted: false,
        hasConfirmedAnswer: false,
        hasInteracted: false,
        hasLeft: false,
        isActive: false,
    },
    {
        id: '2',
        name: 'Player 2',
        score: 0,
        questions: TEST_QUESTIONS,
        fastestResponseCount: 0,
        muted: false,
        hasConfirmedAnswer: false,
        hasInteracted: false,
        hasLeft: false,
        isActive: false,
    },
];

export const TEST_HISTOGRAM_DATA: HistogramData[] = [
    {
        labels: ['Test Label 1', 'Test Label 2'],
        datasets: [
            {
                label: 'Test Dataset',
                data: [1, 2],
            },
        ],
    },
    {
        labels: ['Test Label 3', 'Test Label 4'],
        datasets: [
            {
                label: 'Test Dataset 2',
                data: [3, 4],
            },
        ],
    },
];

export const TEST_GAME_DATA: Game = {
    pin: '1',
    hostId: '1',
    players: TEST_PLAYERS,
    quitters: [],
    quiz: TEST_QUIZZES[0],
    locked: false,
    bannedNames: [],
    histograms: TEST_HISTOGRAM_DATA,
    name: TEST_QUIZZES[0].title,
    date: new Date(),
    nPlayers: TEST_PLAYERS.length,
    bestScore: 0,
    ended: false,
};
