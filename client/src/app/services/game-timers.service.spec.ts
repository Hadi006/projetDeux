import { TestBed } from '@angular/core/testing';

import { GameTimersService } from './game-timers.service';

describe('GameTimersService', () => {
  let service: GameTimersService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(GameTimersService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
