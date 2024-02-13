import { AccessToken } from '@common/access-token';
import { Quiz } from '@common/quiz';

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
export const MATERIAL_PREBUILT_THEMES = [
    {
        value: 'indigo-pink-theme',
        label: 'Indigo & Pink',
    },
    {
        value: 'deeppurple-amber-theme',
        label: 'Deep Purple & Amber',
    },
    {
        value: 'pink-bluegrey-theme',
        label: 'Pink & Blue-grey',
    },
    {
        value: 'purple-green-theme',
        label: 'Purple & Green',
    },
];

export const MATERIAL_DEFAULT_PREBUILT_THEME = MATERIAL_PREBUILT_THEMES[0];
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

export const BLANK_QUIZ: Quiz = {
    id: '',
    title: '',
    visible: false,
    description: '',
    duration: 10,
    lastModification: new Date(),
    questions: [],
};
