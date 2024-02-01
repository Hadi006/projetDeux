import { TestBed } from '@angular/core/testing';

import { GameHandlerService } from '@app/services/game-handler.service';

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
});
