import { TestBed } from '@angular/core/testing';

import { GameHandlerService, TEST_GAME } from '@app/services/game-handler.service';

describe('GameHandlerService', () => {
    let service: GameHandlerService;

    beforeEach(() => {});

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [],
        });
        service = TestBed.inject(GameHandlerService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('loadGameData should load the correct game', () => {
        // TODO - mock the http request
        service.loadGameData();
        expect(service.gameData).toEqual(TEST_GAME);
    });
});
