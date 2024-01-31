import { TestBed } from '@angular/core/testing';
import { Player } from '@app/interfaces/player';
import { Subject } from 'rxjs';

import { PlayerHandlerService } from './player-handler.service';

const MOCK_PLAYERS = new Map<number, Player>([0, 1, 2].map((id) => [id, { score: 0, answerNotifier: new Subject<boolean[]>() }]));

describe('PlayerHandlerService', () => {
    let service: PlayerHandlerService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(PlayerHandlerService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('createPlayer should return a new player and increment nPlayers', () => {
        const nPlayers = service.nPlayers;
        const player = service.createPlayer();

        expect(player).toEqual({ score: 0, answerNotifier: new Subject<boolean[]>() });
        expect(service.nPlayers).toEqual(nPlayers);
    });
});
