import { TestBed } from '@angular/core/testing';

import { GameSocketsService } from './game-sockets.service';

describe('GameSocketsService', () => {
    let service: GameSocketsService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(GameSocketsService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });
});
