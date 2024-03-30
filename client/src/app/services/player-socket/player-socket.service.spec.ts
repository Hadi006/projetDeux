import { TestBed } from '@angular/core/testing';

import { PlayerSocketService } from './player-socket.service';

describe('PlayerSocketService', () => {
  let service: PlayerSocketService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PlayerSocketService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
