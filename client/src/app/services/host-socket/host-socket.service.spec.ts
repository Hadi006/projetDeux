import { TestBed } from '@angular/core/testing';

import { HostSocketService } from './host-socket.service';

describe('HostSocketService', () => {
  let service: HostSocketService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(HostSocketService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
