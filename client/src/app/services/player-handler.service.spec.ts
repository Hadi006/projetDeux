import { TestBed } from '@angular/core/testing';
import { Subject } from 'rxjs';

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

    it('createPlayer should add a player to the map with the correct id', () => {
        const nPlayers = service.nPlayers;
        spyOn(service.players, 'set').and.callThrough();
        const player = service.createPlayer();

        expect(service.players.set).toHaveBeenCalledWith(nPlayers, player);
    });

    it('createPlayer should return a new player and increment nPlayers', () => {
        const nPlayers = service.nPlayers;
        const player = service.createPlayer();

        expect(player).toEqual({ score: 0, answerNotifier: new Subject<boolean[]>() });
        expect(service.nPlayers).toEqual(nPlayers + 1);
    });

    it('cleanUp should unsubscribe all players', () => {
        for (let i = 0; i < 5; i++) {
            service.createPlayer();
        }

        service.players.forEach((player) => {
            spyOn(player.answerNotifier, 'unsubscribe').and.callThrough();
        });

        service.cleanUp();

        service.players.forEach((player) => {
            expect(player.answerNotifier.unsubscribe).toHaveBeenCalled();
        });
    });

});
