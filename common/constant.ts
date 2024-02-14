import { AccessToken } from '@common/access-token';
import { GameData } from '@common/game-data';
import { QuestionData } from '@common/question-data';

/* Components */
export const COUNTDOWN_TIME = 5;
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

export const QUESTIONS_DATA: QuestionData[] = [
    {
        id: 0,
        points: 1,
        question: '1+1?',
        answers: ['1', '2', '3', '4'],
        correctAnswers: ['2'],
        isMCQ: true,
    },
    {
        id: 1,
        points: 4,
        question: 'Open ended question',
        answers: [],
        correctAnswers: [],
        isMCQ: false,
    },
    {
        id: 2,
        points: 2,
        question: '2+2?',
        answers: ['1', '2', '3', '4'],
        correctAnswers: ['4'],
        isMCQ: true,
    },
];

export const TEST_GAME: GameData = {
    id: 0,
    name: 'Math',
    questions: QUESTIONS_DATA,
    timePerQuestion: 10,
};

export const enum GameState {
    ShowQuestion = 0,
    ShowAnswer = 1,
    GameEnded = 2,
}

export const GOOD_ANSWER_MULTIPLIER = 1.2;

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
