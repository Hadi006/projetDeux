import { Subject } from 'rxjs';

export interface Player {
    score: number;
    answerNotifier: Subject<boolean[]>;
}
