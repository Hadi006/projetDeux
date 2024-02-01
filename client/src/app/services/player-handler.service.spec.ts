import { TestBed } from '@angular/core/testing';

import { PlayerHandlerService } from './player-handler.service';

describe('PlayerHandlerService', () => {
    let service: PlayerHandlerService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(PlayerHandlerService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('createPlayer should create a player and increment nPlayers', () => {
        const nPlayers = service.nPlayers;
        const player = service.createPlayer();
        expect(player).toBeTruthy();
        expect(service.nPlayers).toBe(nPlayers + 1);
        expect(service.players.get(nPlayers)).toEqual(player);
    });
});
