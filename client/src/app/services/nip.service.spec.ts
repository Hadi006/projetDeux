import { TestBed } from '@angular/core/testing';

import { NipService } from './nip.service';

describe('NipService', () => {
  let service: NipService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(NipService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
