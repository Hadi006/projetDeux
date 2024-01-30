import { TestBed } from '@angular/core/testing';
import { Player } from '@app/interfaces/player';

import { GameHandlerService, GameState, TEST_GAME, SHOW_ANSWER_DELAY } from '@app/services/game-handler.service';
import { PlayerHandlerService } from '@app/services/player-handler.service';
import { TimeService } from '@app/services/time.service';
import { Subject, Subscription } from 'rxjs';

describe('GameHandlerService', () => {
    let service: GameHandlerService;
    let timeServiceSpy: jasmine.SpyObj<TimeService>;
    let playerHandlerServiceSpy: jasmine.SpyObj<PlayerHandlerService>;

    beforeEach(() => {
    });

    beforeEach(() => {
        TestBed.configureTestingModule({
        });
        service = TestBed.inject(GameHandlerService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

});
