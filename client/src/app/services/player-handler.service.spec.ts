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

    it('handleKeyUp should confirm the answer if Enter is pressed', () => {
        const player = service.createPlayer();
        spyOn(service, 'confirmPlayerAnswer');
        service.handleKeyUp(new KeyboardEvent('keyup', { key: 'Enter' }), player);
        expect(service.confirmPlayerAnswer).toHaveBeenCalled();
    });

    it('handleKeyUp should toggle the answer if a number key is pressed', () => {
        const player = service.createPlayer();
        player.answer = [false, false, false];
        service.handleKeyUp(new KeyboardEvent('keyup', { key: '1' }), player);
        expect(player.answer).toEqual([true, false, false]);
        service.handleKeyUp(new KeyboardEvent('keyup', { key: '1' }), player);
        expect(player.answer).toEqual([false, false, false]);
    });

    it('handleKeyUp should not toggle the answer if a number key is pressed out of range', () => {
        const player = service.createPlayer();
        player.answer = [false, false, false];
        service.handleKeyUp(new KeyboardEvent('keyup', { key: '0' }), player);
        expect(player.answer).toEqual([false, false, false]);
        service.handleKeyUp(new KeyboardEvent('keyup', { key: '4' }), player);
        expect(player.answer).toEqual([false, false, false]);
    });

    it('handleKeyUp should not toggle the answer if a non-number key is pressed', () => {
        const player = service.createPlayer();
        player.answer = [false, false, false];
        service.handleKeyUp(new KeyboardEvent('keyup', { key: 'a' }), player);
        expect(player.answer).toEqual([false, false, false]);
    });

    it('confirmPlayerAnswer should do nothing if player is undefined', () => {
        service.confirmPlayerAnswer(undefined);
    });

    it('confirmPlayerAnswer should confirm the answer and notify the subscribers if all players confirmed', () => {
        const nPlayers = 3;
        for (let i = 0; i < nPlayers; i++) {
            service.createPlayer();
        }
        spyOn(service.allAnswerdSubject, 'next');
        for (let i = 0; i < nPlayers; i++) {
            service.confirmPlayerAnswer(service.players.get(i));
            expect(service.players.get(i)?.answerConfirmed).toBeTrue();
        }
        expect(service.allAnswerdSubject.next).toHaveBeenCalled();
    });

    it('confirmPlayerAnswer should increment nAnswered and reset it if all players confirmed', () => {
        const nPlayers = 3;
        for (let i = 0; i < nPlayers; i++) {
            service.createPlayer();
        }
        spyOn(service.allAnswerdSubject, 'next');
        for (let i = 0; i < nPlayers; i++) {
            service.confirmPlayerAnswer(service.players.get(i));
        }
        expect(service.allAnswerdSubject.next).toHaveBeenCalledTimes(1);
        for (let i = 0; i < nPlayers; i++) {
            service.confirmPlayerAnswer(service.players.get(i));
        }
        expect(service.allAnswerdSubject.next).toHaveBeenCalledTimes(2);
    });
});
