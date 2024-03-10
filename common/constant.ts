import { AccessToken } from '@common/access-token';
import { Quiz } from '@common/quiz';
import { LobbyData } from '@common/lobby-data';
import { Player } from '@common/player';

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

const TEST_PLAYER_DATA: Player[] = [
    {
        id: 1,
        name: 'Player 1',
        score: 0,
        answer: [],
        answerConfirmed: false,
        isCorrect: false,
    },
    {
        id: 2,
        name: 'Player 2',
        score: 0,
        answer: [],
        answerConfirmed: false,
        isCorrect: false,
    },
];

export const TEST_LOBBY_DATA: LobbyData = {
    id: '1',
    players: TEST_PLAYER_DATA,
    started: false,
};

/* Services */
export const INVALID_INDEX = -1;
export const MAX_MESSAGE_LENGTH = 200;
export const SHOW_ANSWER_DELAY = 3;
export const INVALID_TOKEN: AccessToken = { id: '', expirationDate: -1 };

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
    id: 0,
    name: '',
    score: 0,
    answer: [],
    answerConfirmed: false,
    isCorrect: false,
};

export const NEW_LOBBY: LobbyData = {
    id: '',
    players: [],
    started: false,
};

export const LOBBY_ID_MAX = 10000;

export const LOBBY_ID_LENGTH = 4;

export const START_GAME_COUNTDOWN = 5;
