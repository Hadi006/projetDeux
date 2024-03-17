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
/* Guards */
export const UNAUTHORIZED_REDIRECT_URL = 'home/admin/login';
/* Pages */

/* Services */
export const INVALID_INDEX = -1;
export const MAX_MESSAGE_LENGTH = 200;
export const SHOW_ANSWER_DELAY = 3;
export const INVALID_TOKEN: AccessToken = { id: '', expirationDate: -1 };

export const GOOD_ANSWER_BONUS = 0.2;

export const TEN = 10;

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

export const NEW_PLAYER: Player = {
    name: '',
    score: 0,
    questions: [],
    fastestResponseCount: 0,
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

export const NEW_GAME: Game = {
    pin: '',
    hostId: '',
    players: [],
    locked: false,
    bannedNames: [],
    histograms: [{ ...NEW_HISTOGRAM_DATA }],
};

export const GAME_ID_MAX = 10000;

export const GAME_ID_LENGTH = 4;

export const START_GAME_COUNTDOWN = 5;

export const TRANSITION_DELAY = 3;

export const INITIAL_QUESTION_INDEX = -1;

export const ANSWER_TIME_BUFFER = 1000;

/* Classes */
export const TIMER_TICK_RATE = 1000;

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
        id: '1',
        text: 'Test Question',
        type: 'QCM',
        points: 10,
        lastModification: new Date(),
        choices: TEST_ANSWERS,
    },
    {
        id: '2',
        text: 'Test Question 2',
        type: 'QRL',
        points: 10,
        lastModification: new Date(),
        choices: TEST_ANSWERS,
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
        name: 'Player 1',
        score: 0,
        questions: TEST_QUESTIONS,
        fastestResponseCount: 0,
    },
    {
        name: 'Player 2',
        score: 0,
        questions: TEST_QUESTIONS,
        fastestResponseCount: 0,
    },
];

export const TEST_HISTOGRAM_DATA: HistogramData[] = [{
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
}];


export const TEST_GAME_DATA: Game = {
    pin: '1',
    hostId: '1',
    players: TEST_PLAYERS,
    quiz: TEST_QUIZZES[0],
    locked: false,
    bannedNames: [],
    histograms: TEST_HISTOGRAM_DATA,
};

